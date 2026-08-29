"""
Full pipeline test: Image -> Preprocessing -> OCR -> Extraction ->
Normalization -> Structured JSON (the full Member 1 deliverable).

Run from the repo root:
    python -m ai_service.tests.test_pipeline

Or point it at a different image:
    python -m ai_service.tests.test_pipeline path/to/other_image.jpg

Writes the full JSON to output.json (UTF-8) so long results are easy to
view in VS Code, and so redirecting to a file with `>` on Windows can't
crash on non-ASCII characters (OCR sometimes misreads stray characters
from noisy labels -- e.g. a Chinese character -- and Windows' default
terminal encoding, cp1252, can't represent them).
"""

import json
import sys

from ai_service.pipeline import run_pipeline

DEFAULT_IMAGE_PATH = "test_images/test_product.jpg.jpeg"
OUTPUT_PATH = "output.json"


def main():
    image_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_IMAGE_PATH

    result = run_pipeline(image_path)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Full result written to {OUTPUT_PATH} -- open it in VS Code to view.")

    # Short console summary -- safe to print even with odd OCR characters,
    # since we ASCII-escape here instead of relying on terminal encoding.
    print("\n--- SUMMARY ---")
    for field, value in result["product"].items():
        print(f"  {field:20s} -> {value!r}")

    if result["meta"]["errors"]:
        print("\n--- WARNINGS/ERRORS ---")
        for err in result["meta"]["errors"]:
            safe_err = err.encode("ascii", errors="replace").decode("ascii")
            print(f"  - {safe_err}")


if __name__ == "__main__":
    main()
