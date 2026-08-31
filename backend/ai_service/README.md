# Member 1 — AI/OCR Module

Pipeline: `Image → Preprocessing → PaddleOCR → Extraction → Normalization → Structured JSON`

## File structure

```
ai_service/
├── __init__.py
├── types.py          # shared OcrLine data type
├── preprocessing.py   # Stage 2: OpenCV preprocessing
├── ocr.py             # PaddleOCR wrapper (isolates the OCR API)
├── extractor.py        # Stage 3: regex/keyword field extraction
├── normalizer.py       # Stage 4: normalize extracted values
├── schema.py           # Stage 6: JSON contract with Member 2
├── pipeline.py          # Orchestrates everything, handles errors
├── tests/
│   ├── test_ocr_raw.py    # Stage 1: raw OCR only, no extraction
│   └── test_pipeline.py    # Full pipeline, prints final JSON
└── README.md
```

## Setup

You already have this working (per your earlier terminal output):
```powershell
python -m pip install paddleocr paddlepaddle opencv-python
```

## How to run

**IMPORTANT:** run these as modules, from your repo root (the folder
containing `ai_service/`, NOT from inside `ai_service/`), so the relative
imports (`from .ocr import ...`) resolve correctly.

Stage 1 — raw OCR only:
```powershell
python -m ai_service.tests.test_ocr_raw
```

Full pipeline — OCR + extraction + normalization + JSON:
```powershell
python -m ai_service.tests.test_pipeline
```

Regression tests — extraction/normalization logic only, no PaddleOCR
needed (fast, safe to run before every commit/PR):
```powershell
python -m ai_service.tests.test_extractor
```

Or point it at a different test image:
```powershell
python -m ai_service.tests.test_pipeline test_images/some_other_product.jpg
```

## Expected output (full pipeline)

A JSON object matching your team's contract, e.g.:

```json
{
  "schema_version": "1.0",
  "scan_id": "SCAN-A1B2C3D4",
  "product": {
    "manufacturer": "Emami Limited",
    "address": "687, Anandapur, Kol.-700107",
    "mrp": null,
    "net_quantity": "900 g",
    "manufacturing_date": null,
    "consumer_care": "customercare@emamigroup.com",
    "country_of_origin": null
  },
  "confidence": { ... },
  "bounding_boxes": { ... },
  "raw_ocr": { "lines": [...], "num_lines": 40 },
  "meta": { "image_path": "...", "errors": [] }
}
```

`null` fields mean the OCR pipeline genuinely couldn't find that
information in the image (per project spec section 11) — not a bug.
Check `raw_ocr.lines` to confirm whether the text was really absent, or
whether the extractor regex needs improvement.

## Changelog / bugs found & fixed during testing

Testing on the same real product photo across two separate runs (different
detection order each time) surfaced real bugs, now fixed and locked in
with regression tests (`tests/test_extractor.py` + `tests/fixtures/`):

- **Address extractor was order-dependent.** It used to just grab
  "whatever line comes after 'Add.:'" — worked by luck on run 1, grabbed
  an unrelated `"MRP"` line on run 2, since PaddleOCR's detection order
  isn't guaranteed to match visual reading order. Fixed by anchoring on
  a 6-digit PIN code (a reliable marker for the end of an Indian
  address) and searching a window of nearby lines instead of assuming
  adjacency.
- **Manufacturer extractor missed OCR misspellings of "Ltd."** — OCR read
  it as `"Lid."` in one run and `"Ld."` in another, and the `Mfd.By:`
  line was entirely undetected on the second run. Added a fallback that
  anchors on `"Regn. No"` (present on nearly all Indian product labels),
  and normalized suffix variants (`Ld.`/`Lid.` → `Ltd.`) in `normalizer.py`.
- **CLAHE contrast-boost preprocessing was hurting OCR accuracy**, not
  helping — confirmed by comparing the same image with vs. without it
  (`'COMPOSITION: Each 100 g...'` at 0.97 confidence became garbled
  `'COMPOSTON:Eac100gpreared'` with contrast boost on). Default flipped
  to off (`boost_contrast=False`) in `preprocessing.py`.
- **Blank OCR detections** (empty-string text) were leaking into
  `raw_ocr.lines` and could throw off line-adjacency logic. Now filtered
  at the source in `ocr.py`.

## Team-lead requested additions (round 2)- **`font_information` placeholder** added to the schema
  (`schema.py` / `font_info.py`). Reports only whether OCR found
  readable text at all — does NOT estimate physical font size yet. That
  requires a camera-distance/calibration solution, which is future scope.
- **`raw_ocr` upgraded** from a plain list of text strings to a full
  `{text, confidence, bounding_box}` per line — see `pipeline.py`. This
  matches the leader's requested structure for traceability/debugging.
- **New `validator.py`** — OCR-side sanity checks only (is `mrp`
  price-shaped, does `net_quantity` parse, does `manufacturing_date` look
  like a date). Explicitly does NOT decide legal compliance — see the
  module's docstring and `docs/api/ocr-rule-engine-v1.md` for the exact
  boundary. Warnings go into `meta.errors`, never silently drop a value.
- **`docs/api/ocr-rule-engine-v1.md`** — proposed OCR ↔ Rule Engine JSON
  contract, drafted since Member 2 hasn't started yet. Marked as
  proposed/unconfirmed — review it with Member 2 once they're on board,
  per master prompt section 22 (don't change the schema unilaterally
  after that).

## Round 3 — matched against leader's confirmed official contract

- **`bounding_boxes` converted to flat `[xmin, ymin, xmax, ymax]`**,
  matching the leader's official contract exactly (was previously a
  4-point polygon, PaddleOCR's native format). Conversion happens in
  `types.py` (`polygon_to_bbox`), applied only to the official
  `bounding_boxes` field in `pipeline.py`.
- **`raw_ocr` intentionally keeps the native polygon format** — it's a
  Member 1 debugging extra outside the official contract, and the
  polygon is more precise for skewed/rotated text. Documented clearly in
  both `types.py` and the contract doc so this asymmetry doesn't look
  like an inconsistency later.
- **`font_information` and `raw_ocr` kept as extras** beyond the leader's
  official v1 fields (`schema_version`, `scan_id`, `product`,
  `confidence`, `bounding_boxes`) — confirmed with the team this doesn't
  conflict with anything, since Member 2 can simply ignore fields it
  doesn't need.

## Known limitations (be upfront about these to your team / judges)

- **Rotated/sideways photos badly scramble text ordering.** Tested on a
  tissue box photographed sideways (text reads top-to-bottom instead of
  left-to-right) — PaddleOCR grouped text by columns instead of rows,
  producing garbled merged lines and scattering label/value pairs far
  apart in the detection order (e.g. "MRP" and its price ended up 15
  lines apart). This isn't something the extraction layer can fully
  compensate for — **encourage users to photograph labels right-side-up**.
  A rotation-detection preprocessing step is a reasonable Stage 8/9
  improvement if this keeps coming up.
- **MRP extraction assumed a ₹/Rs/INR symbol would always be present.**
  Fixed after finding a real case (tissue box) where OCR dropped the
  currency symbol entirely, leaving a bare decimal number like "100.00"
  next to a detected "MRP" line. Now falls back to a nearby bare-decimal
  match — but intentionally only within a few lines of the "MRP"
  keyword, not a document-wide scan, to avoid mislabeling an unrelated
  number (e.g. a per-unit price, batch code) as the actual MRP.
- **`net_quantity` only recognizes weight/volume units** (g, kg, ml, l).
  Count-based quantities (e.g. "1N" meaning 1 unit, common on tissue/
  paper products) aren't recognized yet — worth discussing with the team
  whether Member 2's Rule Engine needs this, since it's a legitimately
  different declaration type under Legal Metrology rules, not just a
  formatting variant.

- **Address extraction is the weakest field.** Real-world addresses vary
  too much for simple regex. It grabs text after an "Add.:" keyword as a
  best effort. Consider revisiting with NLP/NER once you've tested more
  images (spec section 9, stage 9).
- **OCR misreads.** e.g. "emamigroup" was read as "demamigroup" on a real
  test image — normal OCR noise on small print, not something the
  extraction layer can fix. This is exactly why confidence scores are
  preserved per field, so Member 2 (or a human reviewer) can flag
  low-confidence extractions.
- **Fields may be genuinely absent from a photo** even though they exist
  on the physical package (e.g. MRP/expiry printed on a bottle's neck
  label, not the panel photographed). The pipeline correctly returns
  `null` rather than guessing — but this means good UX later probably
  needs to prompt users to photograph *all* panels of a package, not
  just one.

## Next steps (per your own Stage plan, section 14)

- [x] Stage 1: Image → PaddleOCR → raw text
- [x] Stage 2: preprocessing
- [x] Stage 3: field extraction
- [x] Stage 4: normalization
- [x] Stage 5: structured JSON
- [x] Stage 6: confidence + bounding boxes
- [ ] Stage 7: test across multiple, harder package images (blurry,
      rotated, low light, different product types — see spec section 13)
- [ ] Stage 8: improve weak areas found in Stage 7 (address extraction is
      the most likely candidate)
- [ ] Stage 9: only then consider an ML/NLP model, if rules still fall short
