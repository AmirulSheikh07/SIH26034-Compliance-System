"""
Stage 3: Field extraction.

Turns OCR lines into the fields expected by Member 2's Rule Engine.

Important:
- Never invent a value.
- Prefer keyword/context-based extraction.
- Country of origin is only extracted from an explicit "Made in ..."
  declaration. A manufacturer address containing "India" is NOT enough.
"""

import re
from typing import List, Optional, Tuple

from .types import OcrLine


# value, confidence, bounding box
Match = Tuple[Optional[str], Optional[float], Optional[list]]


def _no_match() -> Match:
    return None, None, None


# ---------------------------------------------------------------------------
# MRP
# ---------------------------------------------------------------------------

def extract_mrp(lines: List[OcrLine]) -> Match:
    """
    Handles:
        MRP ₹699
        MRP: ₹699
        MRP Rs. 699
        MRP INR 699
        MRP
        699.00

    The bare-decimal fallback is only searched near an MRP keyword.
    """

    amount_pattern = re.compile(
        r"(?:₹|Rs\.?|INR)\s*"
        r"(\d+(?:[.,]\d{1,2})?)",
        re.IGNORECASE,
    )

    bare_decimal_pattern = re.compile(
        r"\b(\d{1,5}\.\d{2})\b"
    )

    for i, line in enumerate(lines):

        if "mrp" not in line.text.lower():
            continue

        # Same line
        match = amount_pattern.search(line.text)

        if match:
            amount = match.group(1).replace(",", ".")
            return f"₹{amount}", line.confidence, line.box

        # Nearby lines
        search_window = lines[i + 1:i + 6]

        for nxt in search_window:
            match = amount_pattern.search(nxt.text)

            if match:
                amount = match.group(1).replace(",", ".")
                return f"₹{amount}", nxt.confidence, nxt.box

        # OCR sometimes loses ₹ / Rs
        for nxt in search_window:
            match = bare_decimal_pattern.search(nxt.text)

            if match:
                return f"₹{match.group(1)}", nxt.confidence, nxt.box

    # General currency fallback
    for line in lines:
        match = amount_pattern.search(line.text)

        if match:
            amount = match.group(1).replace(",", ".")
            return f"₹{amount}", line.confidence, line.box

    return _no_match()


# ---------------------------------------------------------------------------
# NET QUANTITY
# ---------------------------------------------------------------------------

def extract_net_quantity(lines: List[OcrLine]) -> Match:
    """
    Handles:
        500g
        500 g
        Net Wt. 500g
        Net Quantity: 500 g
        Net Qty.: 200 ml
        1 kg
        250 ml
        1 litre
    """

    qty_pattern = re.compile(
        r"(\d+(?:\.\d+)?)\s*"
        r"(kg|g|mg|ml|l|litre|liter)\b",
        re.IGNORECASE,
    )

    for i, line in enumerate(lines):

        lower = line.text.lower()

        if (
            "net" in lower
            and (
                "wt" in lower
                or "quantity" in lower
                or "qty" in lower
                or "content" in lower
            )
        ):
            # Same line
            match = qty_pattern.search(line.text)

            if match:
                return (
                    f"{match.group(1)} {match.group(2).lower()}",
                    line.confidence,
                    line.box,
                )

            # Next few OCR lines
            for nxt in lines[i + 1:i + 3]:

                match = qty_pattern.search(nxt.text)

                if match:
                    return (
                        f"{match.group(1)} {match.group(2).lower()}",
                        nxt.confidence,
                        nxt.box,
                    )

    # Standalone quantity fallback
    for line in lines:

        match = qty_pattern.fullmatch(line.text.strip())

        if match:
            return (
                f"{match.group(1)} {match.group(2).lower()}",
                line.confidence,
                line.box,
            )

    return _no_match()


# ---------------------------------------------------------------------------
# MANUFACTURER
# ---------------------------------------------------------------------------

def extract_manufacturer(lines: List[OcrLine]) -> Match:
    """
    Handles:

        Manufactured by: ABC Pvt. Ltd.

    and importantly:

        Manufactured by:
        ABC Pvt. Ltd.

    Also handles:

        Mfd. by: ABC
        Marketed by: ABC
        Packed by: ABC

    The value may be on the next OCR line.
    """

    keyword_pattern = re.compile(
        r"(?:"
        r"mfd\.?\s*by"
        r"|manufactured\s*by"
        r"|marketed\s*by"
        r"|packed\s*by"
        r")"
        r"\s*:?\s*(.*)",
        re.IGNORECASE,
    )

    # --------------------------------------------------
    # 1. Keyword-based extraction
    # --------------------------------------------------

    for i, line in enumerate(lines):

        match = keyword_pattern.search(line.text)

        if not match:
            continue

        value = match.group(1).strip(" .,:;-")

        # Manufacturer is on the SAME line
        if value:
            return value, line.confidence, line.box

        # Manufacturer is on the NEXT OCR line
        for nxt in lines[i + 1:i + 4]:

            value = nxt.text.strip(" .,:;-")

            if not value:
                continue

            lower = value.lower()

            # Do not accidentally take another field
            stop_keywords = [
                "mrp",
                "net qty",
                "net quantity",
                "net wt",
                "batch",
                "date",
                "expiry",
                "use before",
                "consumer care",
                "toll free",
                "e-mail",
                "email",
                "website",
                "regd.",
                "regn.",
            ]

            if any(keyword in lower for keyword in stop_keywords):
                break

            return value, nxt.confidence, nxt.box

    # --------------------------------------------------
    # 2. Registration-number fallback
    # --------------------------------------------------

    regn_pattern = re.compile(
        r"reg(?:n|istration)\.?\s*no",
        re.IGNORECASE,
    )

    for line in lines:

        match = regn_pattern.search(line.text)

        if match:

            before = line.text[:match.start()].strip(" .,:;-")

            if before:
                return before, line.confidence, line.box

    # --------------------------------------------------
    # 3. Company-name fallback
    # --------------------------------------------------

    company_pattern = re.compile(
        r"\b"
        r"([A-Z][A-Za-z0-9&.,()' -]{2,80}"
        r"(?:Pvt\.?\s*Ltd\.?|"
        r"Private\s+Limited|"
        r"Limited|"
        r"Ltd\.?|"
        r"Laboratories))"
        r"\b",
        re.IGNORECASE,
    )

    for line in lines:

        match = company_pattern.search(line.text)

        if match:
            value = match.group(1).strip(" .,:;-")
            return value, line.confidence, line.box

    return _no_match()


# ---------------------------------------------------------------------------
# MANUFACTURING DATE
# ---------------------------------------------------------------------------

def extract_manufacturing_date(lines: List[OcrLine]) -> Match:
    """
    Handles:

        06/2026
        07/24
        09/2025
        MFD 06/2026
        Mfg. Date: 12/2025
        MFD.(M)& M 07/24

    IMPORTANT:
    Expiry dates are not used unless they are attached to an
    explicit manufacturing-date keyword.
    """

    date_pattern = re.compile(
        r"\b("
        r"\d{1,2}[/-]\d{2,4}"
        r"|"
        r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
        r")\b"
    )

    for i, line in enumerate(lines):

        lower = line.text.lower()

        is_manufacturing_context = (
            "mfd" in lower
            or "mfg" in lower
            or "manufactur" in lower
            or "date of mfg" in lower
            or "date of manufacturing" in lower
        )

        if not is_manufacturing_context:
            continue

        # Same line
        match = date_pattern.search(line.text)

        if match:
            return (
                match.group(1),
                line.confidence,
                line.box,
            )

        # Next few lines
        for nxt in lines[i + 1:i + 3]:

            match = date_pattern.search(nxt.text)

            if match:
                return (
                    match.group(1),
                    nxt.confidence,
                    nxt.box,
                )

    return _no_match()


# ---------------------------------------------------------------------------
# CONSUMER CARE
# ---------------------------------------------------------------------------

def extract_consumer_care(lines: List[OcrLine]) -> Match:
    """
    Extracts a consumer-care phone number.

    Handles:

        18001800108
        1800 1800 108
        (022)62487999
        022-62487999
        1800-123-4567

    Also supports email as a fallback.

    Phone is preferred because Member 2's validator checks the
    consumer-care field for a valid contact number.
    """

    email_pattern = re.compile(
        r"[\w.+-]+@[\w-]+\.[\w.-]+",
        re.IGNORECASE,
    )

    # Indian-style phone / toll-free numbers
    phone_patterns = [
        re.compile(r"(?<!\d)\d{10,12}(?!\d)"),
        re.compile(r"\(?0\d{2,5}\)?[-\s]?\d{6,8}"),
    ]

    # --------------------------------------------------
    # 1. Search lines containing consumer-care context
    # --------------------------------------------------

    consumer_context = (
        "consumer care",
        "customer care",
        "toll free",
        "helpline",
        "contact",
        "query",
        "feedback",
    )

    for i, line in enumerate(lines):

        lower = line.text.lower()

        if not any(keyword in lower for keyword in consumer_context):
            continue

        # Search current line + next few lines
        nearby = lines[i:i + 4]

        for candidate in nearby:

            # Prefer phone number
            for pattern in phone_patterns:

                match = pattern.search(candidate.text)

                if match:
                    phone = match.group(0).strip()

                    return (
                        phone,
                        candidate.confidence,
                        candidate.box,
                    )

    # --------------------------------------------------
    # 2. General phone-number fallback
    # --------------------------------------------------

    for line in lines:

        for pattern in phone_patterns:

            match = pattern.search(line.text)

            if match:

                phone = match.group(0).strip()

                return (
                    phone,
                    line.confidence,
                    line.box,
                )

    # --------------------------------------------------
    # 3. Email fallback
    # --------------------------------------------------

    for line in lines:

        match = email_pattern.search(line.text)

        if match:

            return (
                match.group(0),
                line.confidence,
                line.box,
            )

    return _no_match()


# ---------------------------------------------------------------------------
# COUNTRY OF ORIGIN
# ---------------------------------------------------------------------------

def extract_country_of_origin(lines: List[OcrLine]) -> Match:
    """
    IMPORTANT:

    Only accept an explicit country-of-origin declaration.

    Valid examples:

        Made in India
        MADE IN INDIA
        Made in: India
        Country of Origin: India
        Country of Origin India

    DO NOT infer country from:

        HAMDARD LABORATORIES (INDIA)

    because "India" in a manufacturer/company name is not necessarily
    a country-of-origin declaration.
    """

    made_in_pattern = re.compile(
        r"\bmade\s+in\s*:?\s*([A-Za-z][A-Za-z .'-]*)",
        re.IGNORECASE,
    )

    country_pattern = re.compile(
        r"\bcountry\s+of\s+origin\s*:?\s*"
        r"([A-Za-z][A-Za-z .'-]*)",
        re.IGNORECASE,
    )

    for line in lines:

        # --------------------------------------------------
        # Made in India
        # --------------------------------------------------

        match = made_in_pattern.search(line.text)

        if match:

            country = match.group(1).strip(" .,:;-")

            # Remove trailing declaration-like text
            country = re.split(
                r"\b(?:batch|mrp|mfg|mfd|date|expiry)\b",
                country,
                maxsplit=1,
                flags=re.IGNORECASE,
            )[0].strip(" .,:;-")

            if country:
                return (
                    country,
                    line.confidence,
                    line.box,
                )

        # --------------------------------------------------
        # Country of Origin: India
        # --------------------------------------------------

        match = country_pattern.search(line.text)

        if match:

            country = match.group(1).strip(" .,:;-")

            if country:
                return (
                    country,
                    line.confidence,
                    line.box,
                )

    # NO generic "India" fallback here.
    #
    # Example:
    # HAMDARD LABORATORIES (INDIA)
    #
    # should NOT automatically mean:
    # country_of_origin = India

    return _no_match()


# ---------------------------------------------------------------------------
# ADDRESS
# ---------------------------------------------------------------------------

def extract_address(lines: List[OcrLine]) -> Match:
    """
    Extract the manufacturer's address from Indian product labels.

    Handles structures such as:

        Manufactured by:
        COMPANY NAME
        B-1/2/3, Meerut Road, Industrial Area,
        Ghaziabad-201003 (U.P.)

    Also handles:

        Add.: COMPANY NAME, ADDRESS, PIN

    Strategy:
    1. Prefer an address explicitly associated with "Add".
    2. Otherwise find "Manufactured by"/"Mfd. by"/"Packed by"
       and collect the following lines up to the PIN code.
    3. Remove the manufacturer/company name from the address.
    4. Stop before unrelated fields such as Consumer Care.
    """

    pincode_pattern = re.compile(r"\b\d{6}\b")

    address_keyword_pattern = re.compile(
        r"\badd\.?\s*[:\-]?",
        re.IGNORECASE,
    )

    manufacturer_keyword_pattern = re.compile(
        r"(?:"
        r"mfd\.?\s*by"
        r"|manufactured\s*by"
        r"|packed\s*by"
        r"|marketed\s*by"
        r")"
        r"\s*:?",
        re.IGNORECASE,
    )

    stop_pattern = re.compile(
        r"(?:"
        r"mrp"
        r"|net\s*(?:qty|quantity|wt)"
        r"|batch"
        r"|date\s+of\s+(?:mfg|manufactur|expiry)"
        r"|expiry"
        r"|use\s+before"
        r"|consumer\s+care"
        r"|toll\s+free"
        r"|e[-\s]?mail"
        r"|email"
        r"|website"
        r"|regd\.?"
        r"|regn\.?"
        r")",
        re.IGNORECASE,
    )

    def clean(text: str) -> str:
        text = text.strip()
        text = re.sub(r"^[\s:,\-;.]+", "", text)
        text = re.sub(r"[\s,;]+$", "", text)
        return text.strip()

    # ------------------------------------------------------------
    # 1. Explicit "Add:" address
    # ------------------------------------------------------------

    for i, line in enumerate(lines):
        match = address_keyword_pattern.search(line.text)

        if not match:
            continue

        parts = []

        # Text after "Add:"
        same_line = clean(line.text[match.end():])

        if same_line:
            parts.append(same_line)

            # If the same line already contains a PIN code,
            # this is a complete address.
            if pincode_pattern.search(same_line):
                return (
                    " ".join(parts),
                    line.confidence,
                    line.box,
                )

        # Continue through the following OCR lines until PIN code.
        for nxt in lines[i + 1:i + 8]:
            text = clean(nxt.text)

            if not text:
                continue

            if stop_pattern.search(text):
                break

            parts.append(text)

            if pincode_pattern.search(text):
                combined = " ".join(parts)
                confidence = min(
                    [line.confidence] +
                    [x.confidence for x in lines[i + 1:i + 8]
                     if clean(x.text) and not stop_pattern.search(clean(x.text))]
                )

                return (
                    combined,
                    confidence,
                    nxt.box,
                )

    # ------------------------------------------------------------
    # 2. Address following "Manufactured by"
    # ------------------------------------------------------------

    for i, line in enumerate(lines):
        match = manufacturer_keyword_pattern.search(line.text)

        if not match:
            continue

        manufacturer_name = clean(line.text[match.end():])

        collected = []
        confidence_values = []
        address_started = False

        # Start checking lines after "Manufactured by:"
        for nxt in lines[i + 1:i + 8]:
            text = clean(nxt.text)

            if not text:
                continue

            # Stop at unrelated fields.
            if stop_pattern.search(text):
                break

            # The first line is normally the manufacturer/company name.
            # Skip it and begin collecting the address from the next line.
            if not address_started:
                address_started = True

                # If the first line itself contains a PIN code,
                # it may contain the complete address.
                if pincode_pattern.search(text):
                    return (
                        text,
                        nxt.confidence,
                        nxt.box,
                    )

                continue

            collected.append(text)
            confidence_values.append(nxt.confidence)

            # Address normally ends at the PIN code.
            if pincode_pattern.search(text):
                if collected:
                    return (
                        " ".join(collected),
                        min(confidence_values),
                        nxt.box,
                    )

    # ------------------------------------------------------------
    # 3. Generic PIN-code fallback
    # ------------------------------------------------------------

    # Look backwards from a PIN-code line for address-like lines.
    for i, line in enumerate(lines):
        if not pincode_pattern.search(line.text):
            continue

        parts = []
        confidence_values = []

        for j in range(max(0, i - 4), i + 1):
            text = clean(lines[j].text)

            if not text:
                continue

            if stop_pattern.search(text):
                continue

            parts.append(text)
            confidence_values.append(lines[j].confidence)

        if parts:
            combined = " ".join(parts)

            # Avoid returning obviously unrelated text.
            if (
                any(word in combined.lower() for word in [
                    "road",
                    "road,",
                    "area",
                    "nagar",
                    "market",
                    "industrial",
                    "mumbai",
                    "delhi",
                    "ghaziabad",
                    "maharashtra",
                    "uttar",
                    "pradesh",
                    "madhya",
                    "india",
                ])
                or len(combined) > 25
            ):
                return (
                    combined,
                    min(confidence_values),
                    line.box,
                )

    return _no_match()

# ---------------------------------------------------------------------------
# FIELD EXTRACTORS
# ---------------------------------------------------------------------------

FIELD_EXTRACTORS = {
    "manufacturer": extract_manufacturer,
    "address": extract_address,
    "mrp": extract_mrp,
    "net_quantity": extract_net_quantity,
    "manufacturing_date": extract_manufacturing_date,
    "consumer_care": extract_consumer_care,
    "country_of_origin": extract_country_of_origin,
}


# ---------------------------------------------------------------------------
# ORCHESTRATOR
# ---------------------------------------------------------------------------

def extract_fields(lines: List[OcrLine]) -> dict:
    """
    Run every field extractor against the same OCR line list.

    Returns:

    {
        "field": {
            "value": ...,
            "confidence": ...,
            "box": ...
        }
    }
    """

    results = {}

    for field, extractor in FIELD_EXTRACTORS.items():

        value, confidence, box = extractor(lines)

        results[field] = {
            "value": value,
            "confidence": confidence,
            "box": box,
        }

    return results
