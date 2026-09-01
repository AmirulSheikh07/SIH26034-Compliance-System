import re


def validate_mrp(mrp):

    if not isinstance(mrp, str):
        return False

    mrp = mrp.strip()

    pattern = r"^(MRP\s*:?\s*)?₹\s*\d+(?:\.\d{1,2})?$"

    return bool(re.fullmatch(pattern, mrp, re.IGNORECASE))

def validate_net_quantity(quantity):

    if not isinstance(quantity, str):
        return False

    quantity = quantity.strip()

    pattern = r"^\d+(?:\.\d+)?\s*(mg|g|kg|ml|l)$"

    return bool(re.fullmatch(pattern, quantity, re.IGNORECASE))

def validate_date(date):

    if not isinstance(date, str):
        return False

    date = date.strip()

    pattern = r"^(0[1-9]|1[0-2])/\d{2,4}$"
	
    return bool(re.fullmatch(pattern, date))

def validate_consumer_care(contact):

    if not isinstance(contact, str):
        return False

    digits = re.sub(r"\D", "", contact)

    return 10 <= len(digits) <= 15
