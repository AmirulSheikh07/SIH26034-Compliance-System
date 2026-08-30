from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any, Dict, List

from database.database import get_db
from database import models
from rule_engine.engine.compliance_engine import check_compliance

router = APIRouter()


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
    # Mock OCR payload – replace with real OCR output from Member 1
    # ------------------------------------------------------------------
    mock_ocr_input: Dict[str, Any] = {
        "product": {
            "manufacturer": "ABC Foods Pvt Ltd",
            "address": "Nagpur, Maharashtra",
            "mrp": "\u20b9120",
            "net_quantity": "500 g",
            "manufacturing_date": None,   # ← intentionally missing to demo FAIL
            "consumer_care": "18001234567",
            "country_of_origin": "India",
        },
        "confidence": {
            "manufacturer": 0.98,
            "address": 0.96,
            "mrp": 0.99,
            "net_quantity": 0.97,
            "manufacturing_date": None,   # no OCR confidence for missing field
            "consumer_care": 0.91,
            "country_of_origin": 0.98,
        },
        "bounding_boxes": {
            "manufacturer": [10, 20, 300, 50],
            "address":       [10, 60, 300, 90],
            "mrp":           [120, 450, 300, 500],
            "net_quantity":  [10, 150, 200, 180],
            "consumer_care": [10, 300, 250, 330],
            "country_of_origin": [10, 350, 200, 380],
        },
    }

    # ------------------------------------------------------------------
    # Run the compliance engine
    # ------------------------------------------------------------------
    engine_result: Dict[str, Any] = check_compliance(mock_ocr_input)
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
    # Build response – inject DB scan_id and filename
    # ------------------------------------------------------------------
    engine_result["scan_id"] = db_scan.id
    engine_result["filename"] = file.filename

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
