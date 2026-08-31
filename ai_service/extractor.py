"""
Stage 3: Field extraction (project spec section 9).

Turns a flat list of OCR lines into the fields Member 2's Rule Engine
expects. Approach: regex + keyword/context rules first -- only reach for
an ML/NLP model later if this proves insufficient across enough real
test images (spec sections 9 and 25, stage 9).

Rule: never invent a value. If nothing matches, return None (spec 11, 24).
"""

import re
from typing import List, Optional, Tuple

from .types import OcrLine

# value, confidence, bounding box
Match = Tuple[Optional[str], Optional[float], Optional[list]]


def _no_match() -> Match:
    return None, None, None


# --------------------------------------------------------------------------------
# Individual field extractors
# --------------------------------------------------------------------------------

def extract_mrp(lines: List[OcrLine]) -> Match:
    """
    Looks for a currency amount near an 'MRP' keyword, or a bare ₹/Rs
    amount elsewhere. Handles: ₹120, Rs.120, MRP: Rs 120, MRP ₹120/-

    Also falls back to a bare decimal number (e.g. "100.00") near the
    'MRP' keyword when OCR drops the currency symbol entirely -- this is
    a real, observed OCR failure mode (confirmed on a tissue box label
    where "MRP" and "100.00" were detected as separate lines with no ₹
    symbol at all). This fallback is intentionally scoped tightly to
    stay near the 'MRP' keyword -- it does NOT scan the whole document
    for "any number that looks like a price", since that risks grabbing
    an unrelated number (e.g. a per-unit price, batch code, or date) and
    mislabeling it as MRP. Per spec section 24, a wrong guess is worse
    than returning null.
    """
    amount_pattern = re.compile(r"(?:₹|Rs\.?|INR)\s?(\d+(?:[.,]\d{1,2})?)", re.IGNORECASE)
    bare_decimal_pattern = re.compile(r"\b(\d{1,5}\.\d{2})\b")

    for i, line in enumerate(lines):
        if "mrp" in line.text.lower():
            m = amount_pattern.search(line.text)
            if m:
                return f"₹{m.group(1)}", line.confidence, line.box

            search_window = lines[i + 1 : i + 6]
            for nxt in search_window:
                m = amount_pattern.search(nxt.text)
                if m:
                    return f"₹{m.group(1)}", nxt.confidence, nxt.box

            # symbol-less fallback, still scoped to the same nearby window
            for nxt in search_window:
                m = bare_decimal_pattern.search(nxt.text)
                if m:
                    return f"₹{m.group(1)}", nxt.confidence, nxt.box

    for line in lines:
        m = amount_pattern.search(line.text)
        if m:
            return f"₹{m.group(1)}", line.confidence, line.box

    return _no_match()


def extract_net_quantity(lines: List[OcrLine]) -> Match:
    """Handles: 500g, 500 g, Net Wt. 500g, Net Quantity: 500 g, 900g, 1 kg, 250 ml"""
    qty_pattern = re.compile(r"(\d+(?:\.\d+)?)\s?(kg|g|ml|l|litre|liter)\b", re.IGNORECASE)

    for i, line in enumerate(lines):
        lower = line.text.lower()
        if "net" in lower and ("wt" in lower or "quantity" in lower or "qty" in lower):
            m = qty_pattern.search(line.text)
            if m:
                return f"{m.group(1)} {m.group(2).lower()}", line.confidence, line.box
            for nxt in lines[i + 1 : i + 3]:
                m = qty_pattern.search(nxt.text)
                if m:
                    return f"{m.group(1)} {m.group(2).lower()}", nxt.confidence, nxt.box

    # fallback: a standalone weight/volume token anywhere (risky but useful)
    for line in lines:
        m = qty_pattern.fullmatch(line.text.strip())
        if m:
            return f"{m.group(1)} {m.group(2).lower()}", line.confidence, line.box

    return _no_match()


def extract_manufacturer(lines: List[OcrLine]) -> Match:
    """
    Looks for 'Mfd. By', 'Manufactured by', 'Marketed by', or a Ltd/Limited
    company name. Also falls back to the text right before a 'Regn. No'
    (license/registration number) line, which is present on most Indian
    labels even when the 'Mfd. By' line itself wasn't detected by OCR --
    confirmed on real test data where 'Mfd.By:Emami Limited...' was
    entirely missing from one OCR pass, but 'EmamiLd.Regn.No....' still
    was, with 'Ltd.' misread as 'Ld.'. Suffix cleanup happens in
    normalizer.py rather than here, since OCR misspells this suffix
    inconsistently (Ltd./Lid./Ld.) and word-boundary regex can't reliably
    catch it when OCR also drops the space before it.
    """
    keyword_pattern = re.compile(
        r"(?:mfd\.?\s*by|manufactured\s*by|marketed\s*by|packed\s*by)[:\s]*(.+)",
        re.IGNORECASE,
    )
    for line in lines:
        m = keyword_pattern.search(line.text)
        if m and m.group(1).strip():
            return m.group(1).strip(" .,:"), line.confidence, line.box

    regn_pattern = re.compile(r"regn\.?\s*no", re.IGNORECASE)
    for line in lines:
        m = regn_pattern.search(line.text)
        if m:
            before = line.text[: m.start()].strip(" .,:")
            if before:
                return before, line.confidence, line.box

    company_pattern = re.compile(r"([A-Z][A-Za-z&.\s]{2,60}(?:Pvt\.?\s?Ltd\.?|Limited|Ltd\.?))")
    for line in lines:
        m = company_pattern.search(line.text)
        if m:
            return m.group(1).strip(), line.confidence, line.box

    return _no_match()


def extract_manufacturing_date(lines: List[OcrLine]) -> Match:
    """Handles: 06/2026, MFD 06-2026, Mfg. Date: 12/2025, dd/mm/yyyy"""
    date_pattern = re.compile(r"\b(\d{1,2}[/-]\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b")

    for i, line in enumerate(lines):
        lower = line.text.lower()
        if "mfd" in lower or "mfg" in lower or "manufactur" in lower:
            m = date_pattern.search(line.text)
            if m:
                return m.group(1), line.confidence, line.box
            for nxt in lines[i + 1 : i + 3]:
                m = date_pattern.search(nxt.text)
                if m:
                    return m.group(1), nxt.confidence, nxt.box

    return _no_match()


def extract_consumer_care(lines: List[OcrLine]) -> Match:
    """Prefers an email if found, otherwise a phone number."""
    email_pattern = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
    phone_pattern = re.compile(r"\b(\d{2,4}[-\s]?\d{6,8}|\d{10})\b")

    for line in lines:
        m = email_pattern.search(line.text)
        if m:
            return m.group(0), line.confidence, line.box

    for line in lines:
        m = phone_pattern.search(line.text)
        if m:
            return m.group(1), line.confidence, line.box

    return _no_match()


def extract_country_of_origin(lines: List[OcrLine]) -> Match:
    made_in_pattern = re.compile(r"made\s*in\s*([A-Za-z]+)", re.IGNORECASE)

    for line in lines:
        m = made_in_pattern.search(line.text)
        if m:
            return m.group(1).strip(), line.confidence, line.box

    # weaker fallback -- a bare "India" mention is a lower-confidence signal
    for line in lines:
        if re.search(r"\bIndia\b", line.text):
            return "India", line.confidence, line.box

    return _no_match()


def extract_address(lines: List[OcrLine]) -> Match:
    """
    Weakest field to get right with plain regex -- real addresses vary too
    much in format, and PaddleOCR's detection order does NOT reliably
    match visual reading order (confirmed on real test data: 'Add.:' was
    sometimes immediately followed by the real address, and sometimes by
    an unrelated 'MRP' line from a neighbouring text block).

    Anchor strategy instead: Indian addresses reliably end in a 6-digit
    PIN code. Find an 'Add.:' keyword, then search forward a few lines for
    the nearest PIN code, and combine the lines leading up to it -- this
    is far more robust than trusting line order alone. Revisit with
    NLP/NER if this still proves unreliable across more test images
    (spec section 9).
    """
    keyword_pattern = re.compile(r"add\.?\s*[:\-]", re.IGNORECASE)
    pincode_pattern = re.compile(r"\b\d{6}\b")
    # lines that are noise for address purposes even if they fall inside
    # the search window (e.g. price disclaimers physically adjacent to
    # the address block on many Indian product labels)
    noise_pattern = re.compile(r"\b(mrp|tax|batch|usp|exp|mfd|net\s*wt)", re.IGNORECASE)

    keyword_idx = next(
        (i for i, line in enumerate(lines) if keyword_pattern.search(line.text)), None
    )

    search_start = keyword_idx if keyword_idx is not None else 0
    search_end = min(search_start + 6, len(lines))

    for i in range(search_start, search_end):
        if pincode_pattern.search(lines[i].text):
            # window is wider than what we expect to keep, because noisy
            # lines (MRP, tax disclaimers) inside it get filtered out below
            window_start = max(search_start, i - 4)
            parts, confidences = [], []
            for j in range(window_start, i + 1):
                text = keyword_pattern.sub("", lines[j].text).strip()
                if not text or noise_pattern.search(text):
                    continue
                parts.append(text)
                confidences.append(lines[j].confidence)

            if parts:
                combined = " ".join(parts)
                conf = min(confidences)
                return combined, conf, lines[i].box

    return _no_match()


# --------------------------------------------------------------------------------
# Orchestrator
# --------------------------------------------------------------------------------

FIELD_EXTRACTORS = {
    "manufacturer": extract_manufacturer,
    "address": extract_address,
    "mrp": extract_mrp,
    "net_quantity": extract_net_quantity,
    "manufacturing_date": extract_manufacturing_date,
    "consumer_care": extract_consumer_care,
    "country_of_origin": extract_country_of_origin,
}


def extract_fields(lines: List[OcrLine]) -> dict:
    """
    Runs every field extractor against the same OCR line list.
    Returns {field: {"value": ..., "confidence": ..., "box": ...}}
    """
    results = {}
    for field, extractor in FIELD_EXTRACTORS.items():
        value, confidence, box = extractor(lines)
        results[field] = {"value": value, "confidence": confidence, "box": box}
    return results
