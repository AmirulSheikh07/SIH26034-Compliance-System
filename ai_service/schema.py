"""
Standard JSON schema + builder for Member 1 (OCR module) output.

This is the CONTRACT between the OCR module and Member 2's Rule Engine.
Do NOT rename fields or change structure without discussing with the team
(see project spec sections 5 and 22).
"""

from typing import Optional
import uuid


PRODUCT_FIELDS = [
    "manufacturer",
    "address",
    "mrp",
    "net_quantity",
    "manufacturing_date",
    "consumer_care",
    "country_of_origin",
]


def new_scan_id() -> str:
    return f"SCAN-{uuid.uuid4().hex[:8].upper()}"


def build_empty_result(scan_id: Optional[str] = None) -> dict:
    """
    Returns a result dict with every field defaulted to None/empty.
    The pipeline fills this in step by step. If a field is never found,
    it stays None -- per spec section 11, null is better than a guess.
    """
    return {
        "schema_version": "1.0",
        "scan_id": scan_id or new_scan_id(),

        "product": {field: None for field in PRODUCT_FIELDS},
        "confidence": {field: None for field in PRODUCT_FIELDS},
        # Flat rectangles [xmin, ymin, xmax, ymax] per field, matching the
        # official contract (docs/api/ocr-rule-engine-v1.md). Note this
        # differs from raw_ocr below, which keeps PaddleOCR's native
        # 4-point polygon format for more precise debugging.
        "bounding_boxes": {},

        # Placeholder only -- Member 1 does NOT implement physical font
        # size / mm measurement yet. "detected" just means OCR found
        # readable text at all; estimated_size/unit stay null until that
        # capability is actually built (leader's addition, see README).
        "font_information": {
            "detected": False,
            "estimated_size": None,
            "unit": None,
        },

        # Full raw OCR output for traceability/debugging -- one entry per
        # detected text line, each with its own confidence and bounding
        # box, so any extracted field can be traced back to what
        # PaddleOCR actually saw.
        "raw_ocr": [],

        "meta": {
            "image_path": None,
            "errors": [],  # non-fatal warnings: blurry image, no text found, etc.
        },
    }
