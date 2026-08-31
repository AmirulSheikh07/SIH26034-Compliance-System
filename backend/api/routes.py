import cv2
import numpy as np

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any, Dict, List

from database.database import get_db
from database import models
from rule_engine.engine.compliance_engine import check_compliance
from ai_service.ocr import OcrEngine
from ai_service.preprocessing import resize_if_needed
from ai_service.extractor import extract_fields
from ai_service.normalizer import normalize_fields
from ai_service.validator import validate_fields
from ai_service.font_info import build_font_information
from ai_service.schema import build_empty_result
from ai_service.types import polygon_to_bbox

router = APIRouter()

# ---------------------------------------------------------------------------
# OCR engine singleton – instantiated once at startup so the PaddleOCR model
# is loaded into memory only one time, not on every request.
# ---------------------------------------------------------------------------
_ocr_engine = OcrEngine()


# ---------------------------------------------------------------------------
# POST /scan  – submit an image for compliance scanning
# ---------------------------------------------------------------------------
@router.post("/scan", tags=["Scanning"])
async def scan_label(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Accept an uploaded label image, run it through Member 2's compliance
    engine, persist the result to PostgreSQL, and return the full result.

    Response shape (engine output + db scan_id + filename):
        {
            "scan_id":        <int>   ← DB primary key
            "filename":       <str>,
            "overall_status": "COMPLIANT" | "NON_COMPLIANT",
            "checks":         [ { field, status, message, confidence, ... } ],
            "violations":     [ { rule_id, field, severity, message, ... } ],
            "summary":        { total_checks, passed_checks, failed_checks,
                                total_violations }
        }
    """
    # ------------------------------------------------------------------
    # Decode the uploaded image bytes into an OpenCV numpy array.
    # cv2.imdecode handles all common formats (JPEG, PNG, BMP, WEBP, …)
    # without writing anything to disk.
    # ------------------------------------------------------------------
    try:
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        cv2_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if cv2_img is None:
            raise ValueError(
                "cv2.imdecode returned None – the file is not a valid image "
                "or is in an unsupported format."
            )

        # Apply the one preprocessing step that is safe on numpy arrays and
        # consistently helpful: downscale very large images. Contrast/denoise
        # are skipped (both are opt-in in preprocessing.py and can hurt OCR).
        cv2_img = resize_if_needed(cv2_img)

        # ------------------------------------------------------------------
        # Run PaddleOCR directly on the numpy array (OcrEngine.run() accepts
        # Union[str, np.ndarray] – see ai_service/ocr.py line 38).  This
        # bypasses OcrPipeline.run()'s os.path.isfile() gate entirely.
        # ------------------------------------------------------------------
        lines = _ocr_engine.run(cv2_img)

        # Assemble the contract output dict the same way pipeline.py does
        ocr_output: Dict[str, Any] = build_empty_result(scan_id=file.filename)
        ocr_output["meta"]["image_path"] = file.filename
        ocr_output["raw_ocr"] = [
            {"text": l.text, "confidence": l.confidence, "bounding_box": l.box}
            for l in lines
        ]

        if not lines:
            ocr_output["meta"]["errors"].append(
                "OCR returned no text – check image quality/lighting."
            )
        else:
            extracted = extract_fields(lines)
            normalized = normalize_fields(extracted)
            for field, data in extracted.items():
                ocr_output["product"][field] = normalized[field]
                ocr_output["confidence"][field] = data["confidence"]
                if data["box"] is not None:
                    ocr_output["bounding_boxes"][field] = polygon_to_bbox(data["box"])
            ocr_output["meta"]["errors"].extend(validate_fields(ocr_output["product"]))
            ocr_output["font_information"] = build_font_information(lines)

        # Log non-fatal OCR warnings – engine handles missing fields gracefully
        if ocr_output["meta"]["errors"]:
            print(f"[OCR warnings] {ocr_output['meta']['errors']}")

    except HTTPException:
        raise  # re-raise FastAPI errors unchanged
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"OCR pipeline failed: {exc}",
        ) from exc

    # ------------------------------------------------------------------
    # Debug: print OCR extraction results to the uvicorn console so the
    # team can verify what the pipeline actually read from the image.
    # Remove these prints once OCR quality is confirmed.
    # ------------------------------------------------------------------
    print("OCR PRODUCT:", ocr_output.get("product"))
    print("OCR MRP:", ocr_output.get("product", {}).get("mrp"))
    print("OCR CONFIDENCE:", ocr_output.get("confidence", {}).get("mrp"))
    print("OCR BBOX:", ocr_output.get("bounding_boxes", {}).get("mrp"))

    # ------------------------------------------------------------------
    # Run the compliance engine on the real OCR output
    # ------------------------------------------------------------------
    engine_result: Dict[str, Any] = check_compliance(ocr_output)
    summary: Dict[str, Any] = engine_result.get("summary", {})

    # ------------------------------------------------------------------
    # Ensure seed user exists – satisfies the Scan FK constraint.
    # Replace user_id with the real authenticated user once Member 3's
    # auth layer is integrated.
    # ------------------------------------------------------------------
    seed_user = db.query(models.User).filter(models.User.id == 1).first()
    if seed_user is None:
        seed_user = models.User(name="System Inspector", role="inspector")
        db.add(seed_user)
        db.commit()
        db.refresh(seed_user)  # ensures seed_user.id is populated

    # ------------------------------------------------------------------
    # Persist Scan record
    # ------------------------------------------------------------------
    db_scan = models.Scan(
        user_id=seed_user.id,
        image_path=file.filename or "unknown",
        overall_status=engine_result["overall_status"],
        summary_total_checks=summary.get("total_checks"),
        summary_passed_checks=summary.get("passed_checks"),
        summary_failed_checks=summary.get("failed_checks"),
        summary_total_violations=summary.get("total_violations"),
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)  # populates db_scan.id

    # ------------------------------------------------------------------
    # Persist Check records (one row per field check)
    # ------------------------------------------------------------------
    db.add_all(
        [
            models.Check(
                scan_id=db_scan.id,
                field=c["field"],
                status=c["status"],
                message=c.get("message"),
                confidence=c.get("confidence"),
                confidence_level=c.get("confidence_level"),
                review_required=c.get("review_required"),
                bounding_box=c.get("bounding_box"),
            )
            for c in engine_result.get("checks", [])
        ]
    )

    # ------------------------------------------------------------------
    # Persist Violation records (one row per violated rule)
    # ------------------------------------------------------------------
    db.add_all(
        [
            models.Violation(
                scan_id=db_scan.id,
                rule_id=v["rule_id"],
                field=v["field"],
                severity=v["severity"],
                message=v.get("message"),
                confidence=v.get("confidence"),
                confidence_level=v.get("confidence_level"),
                bounding_box=v.get("bounding_box"),
            )
            for v in engine_result.get("violations", [])
        ]
    )

    db.commit()

    # ------------------------------------------------------------------
    # Build response – inject DB scan_id, filename, and extracted product
    # ------------------------------------------------------------------
    engine_result["scan_id"] = db_scan.id
    engine_result["filename"] = file.filename
    engine_result["product"] = ocr_output.get("product", {})

    return engine_result


# ---------------------------------------------------------------------------
# GET /scans  – list the 10 most recent scans from the database
# ---------------------------------------------------------------------------
@router.get("/scans", tags=["Scanning"])
async def list_scans(
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Return the 10 most recent compliance scans stored in the database."""
    scans = (
        db.query(models.Scan)
        .order_by(models.Scan.id.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "scan_id": scan.id,
            "filename": scan.image_path,
            "overall_status": scan.overall_status,
            "summary_total_checks": scan.summary_total_checks,
            "summary_passed_checks": scan.summary_passed_checks,
            "summary_failed_checks": scan.summary_failed_checks,
            "summary_total_violations": scan.summary_total_violations,
            "scanned_at": scan.created_at.isoformat() if scan.created_at else None,
            "inspector_id": scan.user_id,
        }
        for scan in scans
    ]


# ---------------------------------------------------------------------------
# GET /dashboard/stats  – live aggregate statistics from the database
# ---------------------------------------------------------------------------
@router.get("/dashboard/stats", tags=["Dashboard"])
async def dashboard_stats(
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Return real aggregate compliance statistics computed from the database."""
    from sqlalchemy import func

    total: int = db.query(func.count(models.Scan.id)).scalar() or 0
    compliant: int = (
        db.query(func.count(models.Scan.id))
        .filter(models.Scan.overall_status == "COMPLIANT")
        .scalar()
        or 0
    )
    non_compliant: int = (
        db.query(func.count(models.Scan.id))
        .filter(models.Scan.overall_status == "NON_COMPLIANT")
        .scalar()
        or 0
    )

    compliance_rate: float = round((compliant / total * 100), 1) if total > 0 else 0.0

    return {
        "total_inspections": total,
        "compliant": compliant,
        "non_compliant": non_compliant,
        "compliance_rate_percent": compliance_rate,
    }
