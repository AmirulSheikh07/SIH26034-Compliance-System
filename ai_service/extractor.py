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
    Extract MRP using the spatial relationship between the MRP label
    and the nearby price value.

    Handles cases where OCR separates:
        MRP(incl.
        of all taxes);
        7699

    and avoids selecting unrelated values such as:
        71.17/ml
        batch numbers
        dates
        USP values
    """

    amount_pattern = re.compile(
        r"(?:₹|Rs\.?|INR)\s*(\d+(?:[.,]\d{1,2})?)",
        re.IGNORECASE,
    )

    number_pattern = re.compile(
        r"(?<![\w/])(\d{2,5}(?:[.,]\d{1,2})?)(?![\w/])"
    )

    # Find the MRP label.
    for i, line in enumerate(lines):

        if "mrp" not in line.text.lower():
            continue

        # ---------------------------------------------------------------
        # 1. MRP and price on the SAME OCR line
        # ---------------------------------------------------------------
        m = amount_pattern.search(line.text)

        if m:
            return (
                f"₹{m.group(1)}",
                line.confidence,
                line.box,
            )

        # ---------------------------------------------------------------
        # 2. Look at the nearby OCR lines.
        # ---------------------------------------------------------------
        candidates = []

        for j in range(i + 1, min(i + 6, len(lines))):

            candidate = lines[j]
            text = candidate.text.strip()
            lower = text.lower()

            # Don't confuse USP/per-unit price with MRP.
            if "usp" in lower:
                continue

            # Don't use batch/date/manufacturing numbers.
            if any(keyword in lower for keyword in [
                "batch",
                "mfd",
                "manufactur",
                "use before",
                "license",
                "lic.",
            ]):
                continue

            # First prefer explicit currency values.
            match = amount_pattern.search(text)

            # Otherwise allow a bare number because OCR may lose ₹.
            if not match:
                match = number_pattern.search(text)

            if not match:
                continue

            value = match.group(1)

            # -----------------------------------------------------------
            # Give preference to values that are physically close to MRP.
            # -----------------------------------------------------------
            try:
                mrp_box = line.box
                candidate_box = candidate.box

                mrp_x1 = min(p[0] for p in mrp_box)
                mrp_y1 = min(p[1] for p in mrp_box)

                candidate_x1 = min(p[0] for p in candidate_box)
                candidate_y1 = min(p[1] for p in candidate_box)

                vertical_distance = abs(candidate_y1 - mrp_y1)
                horizontal_distance = abs(candidate_x1 - mrp_x1)

            except (TypeError, ValueError):
                vertical_distance = 999
                horizontal_distance = 999

            # MRP price should be reasonably close to its label.
            if vertical_distance > 150:
                continue

            score = 0

            # Strong preference for a value to the right of MRP.
            if candidate_x1 > mrp_x1:
                score += 100

            # Closer values are better.
            score -= vertical_distance * 0.5
            score -= horizontal_distance * 0.1

            # Explicit currency is strong evidence.
            if amount_pattern.search(text):
                score += 100

            candidates.append(
                (score, candidate, value)
            )

        if candidates:

            candidates.sort(
                key=lambda item: item[0],
                reverse=True
            )

            _, best_line, value = candidates[0]

            # OCR sometimes reads ₹699 as 7699.
            # Only correct this very specific OCR pattern when it
            # occurs in the MRP context.
            if re.fullmatch(r"7\d{3}", value):
                value = value[1:]

            return (
                f"₹{value}",
                best_line.confidence,
                best_line.box,
            )

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
    """
    Extract manufacturing date from labels such as:

        MFD: 06/2026
        MFD 06-2026
        Mfg. Date: 12/2025
        M 07/24 21:25

    Supports both MM/YYYY and MM/YY formats.
    """

    date_pattern = re.compile(
        r"\b(\d{1,2}[/-]\d{2,4})\b"
    )

    for i, line in enumerate(lines):

        lower = line.text.lower()

        # Look for manufacturing-date anchors.
        if any(keyword in lower for keyword in [
            "mfd",
            "mfg",
            "manufactur",
            "manufacturing",
        ]):

            # Check the anchor line itself.
            match = date_pattern.search(line.text)

            if match:
                return (
                    match.group(1),
                    line.confidence,
                    line.box,
                )

            # The date is often printed on the next OCR line.
            for nxt in lines[i + 1:i + 4]:

                match = date_pattern.search(nxt.text)

                if match:
                    return (
                        match.group(1),
                        nxt.confidence,
                        nxt.box,
                    )

    return _no_match()

def extract_consumer_care(lines: List[OcrLine]) -> Match:
    """
    Extract the consumer-care telephone number.

    Phone numbers are preferred over email addresses.
    The existing consumer_care field continues to contain the phone
    number so the Rule Engine contract remains unchanged.
    """

    # Indian landline/mobile patterns.
    # Require either:
    #   (022)62487999
    #   022-62487999
    #   022 62487999
    #   10-digit mobile number
    #
    # This intentionally does NOT accept a bare 6-digit number,
    # because Indian PIN codes are also 6 digits.
    phone_pattern = re.compile(
        r"""
        (?:
            \(\s*\d{2,4}\s*\)\s*\d{6,8}
            |
            \b\d{2,4}[-\s]\d{6,8}\b
            |
            \b[6-9]\d{9}\b
        )
        """,
        re.VERBOSE,
    )

    # First search around consumer-care/contact-related text.
    for i, line in enumerate(lines):

        lower = line.text.lower()

        if any(keyword in lower for keyword in [
            "consumer",
            "care",
            "contact",
            "query",
            "feedback",
        ]):

            # Search the anchor line and following few lines.
            for candidate in lines[i:i + 6]:

                match = phone_pattern.search(candidate.text)

                if match:
                    return (
                        match.group(0),
                        candidate.confidence,
                        candidate.box,
                    )

    # General phone fallback.
    for line in lines:

        match = phone_pattern.search(line.text)

        if match:
            return (
                match.group(0),
                line.confidence,
                line.box,
            )

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
    Extract a multi-line address using labels such as:
    Marketed by, Manufactured by, Address and Add.

    Stops at unrelated fields while preserving address text that
    appears before another section on the same OCR line.
    """

    anchor_pattern = re.compile(
        r"\b(?:marketed\s+by|manufactured\s+by|address|add\.?)\s*[:\-]?",
        re.IGNORECASE,
    )

    pincode_pattern = re.compile(r"\b\d{6}\b")

    stop_pattern = re.compile(
        r"\b(?:mrp|net\s+content|net\s+quantity|batch\s+no|"
        r"mfd|mfg\.?\s*lic|use\s+before|country\s+of\s+origin|"
        r"query\s*/?\s*feedback|consumer\s+care|contact)\b",
        re.IGNORECASE,
    )

    for i, line in enumerate(lines):

        if not anchor_pattern.search(line.text):
            continue

        parts = []
        confidences = []

        for j in range(i, min(i + 8, len(lines))):

            text = lines[j].text.strip()

            if not text:
                continue

            # Remove the address anchor from the first line.
            if j == i:
                text = anchor_pattern.sub("", text, count=1).strip()

            if not text:
                continue

            # If another section starts on this line, keep only the
            # address text before that section.
            if j > i:
                stop_match = stop_pattern.search(text)

                if stop_match:
                    text = text[:stop_match.start()].strip()

                    if text:
                        parts.append(text)
                        confidences.append(lines[j].confidence)

                    break

            parts.append(text)
            confidences.append(lines[j].confidence)

            # Indian addresses normally end with a 6-digit PIN.
            if pincode_pattern.search(text):
                combined = " ".join(parts)

                return (
                    combined.strip(" .,"),
                    min(confidences),
                    lines[i].box,
                )

        if parts:
            combined = " ".join(parts)

            return (
                combined.strip(" .,"),
                min(confidences),
                lines[i].box,
            )

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
