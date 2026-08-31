# OCR ↔ Rule Engine Contract — v1

> **Status:** Based on the leader-confirmed "OCR → Rule Engine API
> Contract V1" message. `schema_version`, `scan_id`, `product`,
> `confidence`, and `bounding_boxes` match that message exactly.
> `font_information` and `raw_ocr` are Member 1 extras, kept because they
> don't conflict with the official fields — flag to the team if Member 2
> would rather they be dropped or moved elsewhere.

## Purpose

This document defines the exact JSON structure Member 1's OCR module
outputs, and Member 2's Rule Engine consumes. Member 2 should be able to
build against this contract without knowing anything about how OCR,
PaddleOCR, or field extraction internally work.

```
Product Image → Member 1 (OCR module) → THIS JSON → Member 2 (Rule Engine) → Compliance Result
```

## Schema

```json
{
  "schema_version": "1.0",
  "scan_id": "SCAN-A1B2C3D4",

  "product": {
    "manufacturer": "Emami Ltd.",
    "address": "Care Office, EMAMI LTD. 687, Anandapur, Kol.-700107",
    "mrp": null,
    "net_quantity": "900 g",
    "manufacturing_date": null,
    "consumer_care": "customercare@emamigroup.com",
    "country_of_origin": null
  },

  "confidence": {
    "manufacturer": 0.81,
    "address": 0.98,
    "mrp": null,
    "net_quantity": 1.0,
    "manufacturing_date": null,
    "consumer_care": 1.0,
    "country_of_origin": null
  },

  "bounding_boxes": {
    "manufacturer": [120, 450, 300, 500],
    "net_quantity": [140, 520, 310, 560]
  },

  "font_information": {
    "detected": true,
    "estimated_size": null,
    "unit": null
  },

  "raw_ocr": [
    {
      "text": "Net Wt.",
      "confidence": 0.99,
      "bounding_box": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  ],

  "meta": {
    "image_path": "test_images/example.jpg",
    "errors": []
  }
}
```

## Field notes for Member 2

- **`product.*` — `null` means genuinely not found**, not a guess and not
  a zero/empty string. Treat `null` as "OCR could not determine this
  field" — it's on Member 2 to decide what that means for compliance
  (e.g. missing MRP might itself be a violation to flag, separately from
  whatever OCR's confidence says).
- **`confidence.*`** — a 0–1 float per field, only present (non-null)
  when the field itself is non-null. Comes from PaddleOCR's own
  recognition confidence for the underlying text; not fabricated.
- **`bounding_boxes.*`** — only present for fields that were actually
  extracted. Coordinates are in the original image's pixel space, as a
  flat rectangle `[xmin, ymin, xmax, ymax]`, matching the leader's
  contract exactly. (Note: `raw_ocr` below intentionally keeps
  PaddleOCR's native 4-point polygon format instead — see its entry.)
- **`font_information`** — placeholder only right now.
  `detected: true` just means OCR found readable text somewhere in the
  image — it does NOT mean font size/legibility was measured.
  `estimated_size`/`unit` will stay `null` until physical font
  measurement is actually built (future scope, not blocking).
- **`raw_ocr`** — every line PaddleOCR detected, unfiltered, for
  traceability/debugging. Keeps PaddleOCR's native 4-point polygon
  format for `bounding_box` (more precise than the flat rectangle used
  in the official `bounding_boxes` field above — useful for debugging
  skewed/rotated text). If `product.mrp` looks wrong, Member 2 (or a
  human reviewer) can check `raw_ocr` to see what OCR actually read.
  This is NOT meant to be a data source for the Rule Engine's actual
  compliance logic — use `product`/`confidence` for that.
- **`meta.errors`** — non-fatal warnings from Member 1's own OCR-side
  sanity checks (e.g. "net_quantity value doesn't parse as number+unit")
  or pipeline issues (blurry image, no text found). **These are NOT
  compliance violations** — they're signals about OCR data quality, not
  about whether the product itself is legally compliant. Legal
  compliance decisions belong entirely to Member 2's Rule Engine.

## Explicit boundary: OCR-side validation vs. legal compliance

Member 1's module (`validator.py`) only checks whether extracted values
are **plausible data** — e.g. does `mrp` contain a currency symbol and a
number, does `net_quantity` parse as number+unit. It never asks whether
a product is *compliant*.

| Member 1 asks (OCR-side)                  | Member 2 asks (compliance) |
|---------------------------------------------|-----------------------------|
| Is this MRP text shaped like a price?      | Is MRP present, as legally required? |
| Does this quantity string parse?           | Is the declared quantity within legal tolerance? |
| Does this look like a date?                | Is the manufacturing date valid/not expired? |
| —                                           | Is the font size legally compliant? |

If a check ever starts to sound like the right-hand column, it belongs
in Member 2's Rule Engine, not here.

## Changing this contract

Per the master prompt: don't change field names or structure casually.
If a change is needed, discuss it with whoever owns Member 2's module
first — a schema change here breaks their code without warning otherwise.
