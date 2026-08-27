import re


def validate_mrp(mrp):
    if not isinstance(mrp, str):
        return False

    pattern = r"₹\s?\d+(\.\d{1,2})?"
    return bool(re.fullmatch(pattern, mrp.strip()))


def validate_net_quantity(quantity):
    if not isinstance(quantity, str):
        return False

    pattern = r"\d+(\.\d+)?\s?(mg|g|kg|ml|l|L)"
    return bool(re.fullmatch(pattern, quantity.strip(), re.IGNORECASE))


def validate_date(date):
    if not isinstance(date, str):
        return False

    pattern = r"\d{2}/\d{4}"
    return bool(re.fullmatch(pattern, date.strip()))


def validate_consumer_care(contact):
    if not isinstance(contact, str):
        return False

    digits = re.sub(r"\D", "", contact)

    return len(digits) >= 10
