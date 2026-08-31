"""
Shared lightweight data types used across the pipeline.

Kept separate from ocr.py so that extractor.py / normalizer.py can be
imported and unit-tested without needing PaddleOCR installed.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class OcrLine:
    text: str
    confidence: float
    box: Optional[list]  # polygon points: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] or None


def polygon_to_bbox(polygon: Optional[list]) -> Optional[list]:
    """
    Converts a 4-point polygon (PaddleOCR's native detection format) into
    the flat rectangle format [xmin, ymin, xmax, ymax] that the official
    OCR<->Rule Engine contract (docs/api/ocr-rule-engine-v1.md) expects
    for the top-level `bounding_boxes` field.

    Note: `raw_ocr` in the pipeline output intentionally keeps the
    original polygon points, not this flat format -- raw_ocr is a
    debugging/traceability extra outside the official contract, and the
    polygon is more precise (handles slightly rotated/skewed text,
    whereas a flat rectangle would lose that).
    """
    if not polygon:
        return None
    xs = [p[0] for p in polygon]
    ys = [p[1] for p in polygon]
    return [min(xs), min(ys), max(xs), max(ys)]
