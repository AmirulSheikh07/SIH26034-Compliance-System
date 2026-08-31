"""
Top-level pipeline: Image -> Preprocessing -> OCR -> Extraction ->
Normalization -> Structured JSON.

This is the single entry point Member 2 (or a test script, or eventually
Member 3's backend) should call. Output matches the JSON contract in
project spec section 5. Handles bad input gracefully (spec section 12)
instead of crashing -- errors go into result["meta"]["errors"].
"""

import os
from typing import Optional

from .ocr import OcrEngine
from .preprocessing import preprocess
from .extractor import extract_fields
from .normalizer import normalize_fields
from .validator import validate_fields
from .font_info import build_font_information
from .schema import build_empty_result
from .types import polygon_to_bbox


class OcrPipeline:
    def __init__(self, lang: str = "en"):
        # Loading the OCR engine is slow (model init) -- do it once and
        # reuse it, rather than re-creating it per image.
        self._engine = OcrEngine(lang=lang)

    def run(
        self,
        image_path: str,
        *,
        use_preprocessing: bool = True,
        scan_id: Optional[str] = None,
    ) -> dict:
        result = build_empty_result(scan_id=scan_id)
        result["meta"]["image_path"] = image_path

        # --- missing / invalid file --------------------------------------------
        if not image_path or not os.path.isfile(image_path):
            result["meta"]["errors"].append(f"Image file not found: {image_path}")
            return result

        # --- preprocessing --------------------------------------------------------
        try:
            image_input = preprocess(image_path) if use_preprocessing else image_path
        except Exception as exc:
            result["meta"]["errors"].append(f"Preprocessing failed, using raw image: {exc}")
            image_input = image_path

        # --- OCR --------------------------------------------------------------------
        try:
            lines = self._engine.run(image_input)
        except Exception as exc:
            result["meta"]["errors"].append(f"OCR failed: {exc}")
            return result

        result["raw_ocr"] = [
            {"text": l.text, "confidence": l.confidence, "bounding_box": l.box}
            for l in lines
        ]

        if not lines:
            result["meta"]["errors"].append("OCR returned no text -- check image quality/lighting.")
            return result

        # --- extraction ---------------------------------------------------------------
        extracted = extract_fields(lines)

        # --- normalization --------------------------------------------------------------
        normalized_values = normalize_fields(extracted)

        for field, data in extracted.items():
            result["product"][field] = normalized_values[field]
            result["confidence"][field] = data["confidence"]
            if data["box"] is not None:
                # official contract expects flat [xmin, ymin, xmax, ymax],
                # not PaddleOCR's native 4-point polygon (see types.py)
                result["bounding_boxes"][field] = polygon_to_bbox(data["box"])

        # --- OCR-side validation (NOT legal compliance -- see validator.py) --------------
        result["meta"]["errors"].extend(validate_fields(result["product"]))

        # --- font information placeholder (see font_info.py) ------------------------------
        result["font_information"] = build_font_information(lines)

        return result


def run_pipeline(image_path: str, **kwargs) -> dict:
    """Convenience function -- creates a pipeline and runs it in one call."""
    pipeline = OcrPipeline()
    return pipeline.run(image_path, **kwargs)
