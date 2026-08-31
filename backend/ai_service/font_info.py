"""
Placeholder for font/readability information (leader's addition -- ties
into the frontend's planned "font size & readability results" and the
project's future physical-font-analysis innovation track).

Member 1 does NOT implement physical font size / mm measurement in this
version. This module only reports whether OCR detected readable text at
all -- it does not estimate size. Wire in real measurement later (e.g.
bounding-box height -> physical size, once camera distance/calibration
is solved) without touching pipeline.py's structure.
"""

from typing import List

from .types import OcrLine


def build_font_information(lines: List[OcrLine]) -> dict:
    return {
        "detected": len(lines) > 0,
        "estimated_size": None,
        "unit": None,
    }
