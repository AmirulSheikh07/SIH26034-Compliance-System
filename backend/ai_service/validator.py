"""
Stage: OCR-side validation / sanity checks (project spec section 4, and
Member 1 leader's clarification).

IMPORTANT BOUNDARY -- read this before adding anything here:

  This module checks whether an extracted value is a PLAUSIBLE PIECE OF
  TEXT/DATA -- nothing more. For example:
    - Is the MRP string actually a number-shaped thing? ("₹120" -- yes.
      "lincl. of all taxes" -- no, that's not a price.)
    - Is the net_quantity string actually parseable as number + unit?
    - Does the manufacturing_date string look like a real date pattern?

  This module NEVER decides:
    - Whether a product is legally compliant
    - Whether a missing field is a violation
    - Whether a font size meets Legal Metrology requirements
    - Whether a declared quantity is truthful/accurate

  All of that belongs to Member 2's Rule Engine, which consumes our JSON
  output. If you're tempted to add a compliance-flavoured check here,
  stop -- it belongs in Member 2's module, not here (spec section 21).

This stage does NOT reject or discard values -- it only annotates the
result with warnings in meta["errors"], so nothing here can turn a real
extracted value into null. That decision (keep vs. discard) stays with
whoever consumes this data.
"""

import re


def _looks_like_price(value: str) -> bool:
    return bool(re.search(r"\d", value)) and bool(re.search(r"₹|Rs\.?|INR", value, re.IGNORECASE))


def _looks_like_quantity(value: str) -> bool:
    return bool(re.match(r"\d+(\.\d+)?\s?(kg|g|ml|l)$", value, re.IGNORECASE))


def _looks_like_date(value: str) -> bool:
    return bool(re.match(r"\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?$|\d{1,2}[/-]\d{4}$", value))


def validate_fields(product: dict) -> list:
    """
    Runs plausibility checks against already-extracted+normalized field
    values. Returns a list of warning strings (empty if everything looks
    plausible or fields are simply null). Never raises, never modifies
    `product` -- purely observational.
    """
    warnings = []

    mrp = product.get("mrp")
    if mrp is not None and not _looks_like_price(mrp):
        warnings.append(f"OCR sanity check: mrp value {mrp!r} doesn't look like a price.")

    net_quantity = product.get("net_quantity")
    if net_quantity is not None and not _looks_like_quantity(net_quantity):
        warnings.append(
            f"OCR sanity check: net_quantity value {net_quantity!r} doesn't parse as number+unit."
        )

    manufacturing_date = product.get("manufacturing_date")
    if manufacturing_date is not None and not _looks_like_date(manufacturing_date):
        warnings.append(
            f"OCR sanity check: manufacturing_date value {manufacturing_date!r} doesn't look like a date."
        )

    return warnings
