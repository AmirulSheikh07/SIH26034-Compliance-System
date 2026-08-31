"""
Regression tests for extractor.py + normalizer.py, using REAL OCR output
captured from two actual test runs on the same product photo (see
fixtures/ below). PaddleOCR does not always detect the same lines in the
same order between runs -- these two fixtures already caught real bugs
(address extractor grabbing the wrong line, manufacturer missing when
"Ltd." was OCR'd as "Ld.") once. Keeping both as permanent test cases
stops those bugs from silently coming back.

Run with:
    python -m ai_service.tests.test_extractor
"""

import json
import os

from ai_service.types import OcrLine
from ai_service.extractor import extract_fields
from ai_service.normalizer import normalize_fields

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")

# Expected values are what the CURRENT extractor produces on this real
# data -- treat them as a known-good baseline, not perfect ground truth.
# If you intentionally improve extraction, update these expectations too.
EXPECTED = {
    "run1_first_test.json": {
        "manufacturer": "EmamiLimitedK)Pacharia,Dolapahar",
        "address": "Care Office, EMAMILTD.687, Anandapur, Kol.-700107",
        "mrp": None,
        "net_quantity": "900 g",
        "manufacturing_date": None,
        "consumer_care": "customercare@demamigroup.com",
        "country_of_origin": None,
    },
    "run2_backup_location.json": {
        "manufacturer": "Emami Ltd.",
        "address": "Care Office, EMAMILTD.687, Anandapur, Kol-700107",
        "mrp": None,
        "net_quantity": None,  # genuinely absent from this OCR pass -- not a bug
        "manufacturing_date": None,
        "consumer_care": "customercare@emamigroup.com",
        "country_of_origin": None,
    },
}

def load_fixture(filename):
    path = os.path.join(FIXTURES_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [OcrLine(text=item["text"], confidence=item["confidence"], box=None) for item in raw]


def run_fixture(filename):
    lines = load_fixture(filename)
    extracted = extract_fields(lines)
    normalized = normalize_fields(extracted)
    expected = EXPECTED[filename]

    passed = True
    print(f"--- {filename} ---")
    for field, expected_value in expected.items():
        actual_value = normalized[field]
        ok = actual_value == expected_value
        passed = passed and ok
        status = "OK  " if ok else "FAIL"
        print(f"  [{status}] {field:20s} expected={expected_value!r:50s} actual={actual_value!r}")
    print()
    return passed


def main():
    results = [run_fixture(f) for f in EXPECTED]

    # extra unit check (not fixture-based -- a small synthetic case) for
    # the symbol-less MRP fallback, since OCR dropping the ₹ symbol
    # entirely is a real observed failure mode (tissue box test image)
    from ai_service.types import OcrLine
    from ai_service.extractor import extract_mrp

    value, _, _ = extract_mrp([OcrLine("MRP", 0.99, None), OcrLine("100.00", 0.99, None)])
    ok = value == "₹100.00"
    results.append(ok)
    status = "OK  " if ok else "FAIL"
    print(f"[{status}] symbol-less MRP fallback -> {value!r} (expected '₹100.00')\n")

    if all(results):
        print("All regression checks passed.")
    else:
        print("Some regression checks FAILED -- see above.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
