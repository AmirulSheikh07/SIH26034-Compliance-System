"""
Stage 1 sanity check: Image -> PaddleOCR -> raw text.

Run from the repo root:
    python -m ai_service.tests.test_ocr_raw
"""

import os
from ai_service.ocr import OcrEngine

# Adjust this path if your test image lives somewhere else.
IMAGE_PATH = "test_images/test_product.jpg.jpeg"


def main():
    if not os.path.isfile(IMAGE_PATH):
        print(f"Image not found at '{IMAGE_PATH}'. Update IMAGE_PATH in this file.")
        return

    engine = OcrEngine(lang="en")
    lines = engine.run(IMAGE_PATH)

    print("=== RAW OCR OUTPUT (Stage 1) ===\n")
    for line in lines:
        print(f"Text: {line.text!r:50s}  Confidence: {line.confidence:.2f}")

    print(f"\nTotal lines detected: {len(lines)}")


if __name__ == "__main__":
    main()
