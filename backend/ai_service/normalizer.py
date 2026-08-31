"""
Stage 4: Normalization (project spec section 10).

Makes extracted values consistent without destroying information the
Rule Engine might need. E.g. "Rs.120", "MRP ₹120/-" -> "₹120".
"""

import re


def normalize_mrp(value: str) -> str:
    if not value:
        return value
    m = re.search(r"(\d+(?:[.,]\d{1,2})?)", value)
    return f"₹{m.group(1)}" if m else value


def normalize_net_quantity(value: str) -> str:
    if not value:
        return value
    m = re.match(r"(\d+(?:\.\d+)?)\s?(kg|g|ml|l|litre|liter)", value, re.IGNORECASE)
    if not m:
        return value
    number, unit = m.group(1), m.group(2).lower()
    unit_map = {"litre": "l", "liter": "l"}
    unit = unit_map.get(unit, unit)
    return f"{number} {unit}"


def normalize_date(value: str) -> str:
    if not value:
        return value
    # Only normalize the separator style. We do NOT guess a missing day --
    # if OCR only found mm/yyyy, that stays mm/yyyy (spec section 11).
    return value.replace("-", "/")


def normalize_manufacturer(value: str) -> str:
    if not value:
        return value
    value = re.sub(r"\s+", " ", value).strip(" .,:")
    # OCR commonly misreads "Ltd." as "Lid." or "Ld." on Indian labels
    # (confirmed on real test data). Normalize the suffix...
    value = re.sub(r"(?i)(lid|ld)\.?$", "Ltd.", value)
    # ...then add a space if OCR ran it straight into the company name
    # (e.g. "EmamiLtd." -> "Emami Ltd.").
    value = re.sub(r"(?i)([a-z])(Ltd\.|Limited)$", r"\1 \2", value)
    return value


def normalize_address(value: str) -> str:
    if not value:
        return value
    return re.sub(r"\s+", " ", value).strip(" .,:")


def normalize_consumer_care(value: str) -> str:
    if not value:
        return value
    if "@" in value:
        return value.strip()
    return re.sub(r"[\s-]", "", value)


def normalize_country(value: str) -> str:
    if not value:
        return value
    return value.strip().title()


NORMALIZERS = {
    "manufacturer": normalize_manufacturer,
    "address": normalize_address,
    "mrp": normalize_mrp,
    "net_quantity": normalize_net_quantity,
    "manufacturing_date": normalize_date,
    "consumer_care": normalize_consumer_care,
    "country_of_origin": normalize_country,
}


def normalize_fields(extracted: dict) -> dict:
    """Applies the matching normalizer to each field's raw extracted value."""
    normalized = {}
    for field, data in extracted.items():
        value = data["value"]
        normalizer = NORMALIZERS.get(field)
        normalized[field] = normalizer(value) if normalizer else value
    return normalized
