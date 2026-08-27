from rule_engine.rules.mandatory_rules import MANDATORY_FIELDS
from rule_engine.validators.field_validator import is_present
from rule_engine.validators.format_validator import (
    validate_mrp,
    validate_net_quantity,
    validate_date,
    validate_consumer_care
)


def check_compliance(data):

    checks = []
    violations = []

    # Validate input structure
    if not isinstance(data, dict):
        return {
            "overall_status": "INVALID_INPUT",
            "checks": [],
            "violations": [
                {
                    "rule_id": "INPUT-001",
                    "field": "root",
                    "severity": "HIGH",
                    "message": "Input must be a JSON object"
                }
            ]
        }

    if "product" not in data or not isinstance(data["product"], dict):
        return {
            "overall_status": "INVALID_INPUT",
            "checks": [],
            "violations": [
                {
                    "rule_id": "INPUT-002",
                    "field": "product",
                    "severity": "HIGH",
                    "message": "Product data is missing or invalid"
                }
            ]
        }

    product_data = data["product"]
    # Check mandatory fields
    for field in MANDATORY_FIELDS:

        value = product_data.get(field)

        if not is_present(value):
            checks.append({
                "field": field,
                "status": "FAIL",
                "message": f"{field} declaration is missing"
            })

            violations.append({
                "rule_id": f"LM-{field.upper()}",
                "field": field,
                "severity": "HIGH",
                "message": f"Required {field} declaration is missing"
            })

        else:
            checks.append({
                "field": field,
                "status": "PASS",
                "message": f"{field} declaration detected"
            })

    # Format validation
    if is_present(product_data.get("mrp")):
        if not validate_mrp(product_data["mrp"]):
            checks.append({
                "field": "mrp",
                "status": "FAIL",
                "message": "Invalid MRP format"
            })

            violations.append({
                "rule_id": "LM-MRP-FORMAT",
                "field": "mrp",
                "severity": "MEDIUM",
                "message": "MRP format appears invalid"
            })

    if is_present(product_data.get("net_quantity")):
        if not validate_net_quantity(product_data["net_quantity"]):
            checks.append({
                "field": "net_quantity",
                "status": "FAIL",
                "message": "Invalid net quantity format"
            })

            violations.append({
                "rule_id": "LM-NET-QTY-FORMAT",
                "field": "net_quantity",
                "severity": "MEDIUM",
                "message": "Net quantity format appears invalid"
            })

    if is_present(product_data.get("manufacturing_date")):
        if not validate_date(product_data["manufacturing_date"]):
            checks.append({
                "field": "manufacturing_date",
                "status": "FAIL",
                "message": "Invalid manufacturing date format"
            })

            violations.append({
                "rule_id": "LM-DATE-FORMAT",
                "field": "manufacturing_date",
                "severity": "MEDIUM",
                "message": "Manufacturing date format appears invalid"
            })

    if is_present(product_data.get("consumer_care")):
        if not validate_consumer_care(product_data["consumer_care"]):
            checks.append({
                "field": "consumer_care",
                "status": "FAIL",
                "message": "Invalid consumer care contact"
            })

            violations.append({
                "rule_id": "LM-CONSUMER-CARE",
                "field": "consumer_care",
                "severity": "MEDIUM",
                "message": "Consumer care contact appears invalid"
            })

    overall_status = (
        "COMPLIANT"
        if len(violations) == 0
        else "NON_COMPLIANT"
    )

    return {
        "overall_status": overall_status,
        "checks": checks,
        "violations": violations
    }
