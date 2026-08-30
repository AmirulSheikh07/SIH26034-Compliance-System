from rule_engine.rules.mandatory_rules import MANDATORY_RULES
from rule_engine.validators.field_validator import is_present
from rule_engine.validators.format_validator import (
    validate_mrp,
    validate_net_quantity,
    validate_date,
    validate_consumer_care
)
from rule_engine.validators.confidence_validator import get_confidence_level


def check_compliance(data):

    checks = []
    violations = []

    # --------------------------------------------------
    # Input validation
    # --------------------------------------------------

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

    # --------------------------------------------------
    # OCR confidence information
    # --------------------------------------------------

    confidence_data = data.get("confidence", {})

    if not isinstance(confidence_data, dict):
        confidence_data = {}

    # --------------------------------------------------
    # OCR bounding box information
    # --------------------------------------------------

    bounding_boxes = data.get("bounding_boxes", {})

    if not isinstance(bounding_boxes, dict):
        bounding_boxes = {}

    # --------------------------------------------------
    # Mandatory field validation
    # --------------------------------------------------

    for rule in MANDATORY_RULES:

        field = rule["field"]
        rule_id = rule["rule_id"]
        severity = rule["severity"]

        value = product_data.get(field)
        confidence = confidence_data.get(field)

        confidence_level = get_confidence_level(confidence)

        bounding_box = bounding_boxes.get(field)

        # --------------------------------------------------
        # Missing field
        # --------------------------------------------------

        if not is_present(value):

            checks.append({
                "field": field,
                "status": "FAIL",
                "message": f"{field} declaration is missing",
                "confidence": confidence,
                "confidence_level": confidence_level,
                "review_required": confidence_level == "LOW",
                "bounding_box": bounding_box
            })

            violations.append({
                "rule_id": rule_id,
                "field": field,
                "severity": severity,
                "message": f"Required {field} declaration is missing",
                "confidence": confidence,
                "confidence_level": confidence_level,
                "bounding_box": bounding_box
            })

            continue

        # --------------------------------------------------
        # Field detected
        # --------------------------------------------------

        checks.append({
            "field": field,
            "status": "PASS",
            "message": f"{field} declaration detected",
            "confidence": confidence,
            "confidence_level": confidence_level,
            "review_required": confidence_level == "LOW",
            "bounding_box": bounding_box
        })

    # --------------------------------------------------
    # MRP format validation
    # --------------------------------------------------

    mrp = product_data.get("mrp")

    if is_present(mrp) and not validate_mrp(mrp):

        checks.append({
            "field": "mrp",
            "status": "FAIL",
            "message": "Invalid MRP format"
        })

        violations.append({
            "rule_id": "LM-MRP-FORMAT",
            "field": "mrp",
            "severity": "MEDIUM",
            "message": "MRP format appears invalid",
            "confidence": confidence_data.get("mrp"),
            "confidence_level": get_confidence_level(
                confidence_data.get("mrp")
            ),
            "bounding_box": bounding_boxes.get("mrp")
        })

    # --------------------------------------------------
    # Net quantity format validation
    # --------------------------------------------------

    net_quantity = product_data.get("net_quantity")

    if is_present(net_quantity) and not validate_net_quantity(net_quantity):

        checks.append({
            "field": "net_quantity",
            "status": "FAIL",
            "message": "Invalid net quantity format"
        })

        violations.append({
            "rule_id": "LM-NET_QUANTITY-FORMAT",
            "field": "net_quantity",
            "severity": "MEDIUM",
            "message": "Net quantity format appears invalid",
            "confidence": confidence_data.get("net_quantity"),
            "confidence_level": get_confidence_level(
                confidence_data.get("net_quantity")
            ),
            "bounding_box": bounding_boxes.get("net_quantity")
        })

    # --------------------------------------------------
    # Manufacturing date format validation
    # --------------------------------------------------

    manufacturing_date = product_data.get("manufacturing_date")

    if is_present(manufacturing_date) and not validate_date(
        manufacturing_date
    ):

        checks.append({
            "field": "manufacturing_date",
            "status": "FAIL",
            "message": "Invalid manufacturing date format"
        })

        violations.append({
            "rule_id": "LM-MANUFACTURING_DATE-FORMAT",
            "field": "manufacturing_date",
            "severity": "MEDIUM",
            "message": "Manufacturing date format appears invalid",
            "confidence": confidence_data.get("manufacturing_date"),
            "confidence_level": get_confidence_level(
                confidence_data.get("manufacturing_date")
            ),
            "bounding_box": bounding_boxes.get("manufacturing_date")
        })

    # --------------------------------------------------
    # Consumer care format validation
    # --------------------------------------------------

    consumer_care = product_data.get("consumer_care")

    if is_present(consumer_care) and not validate_consumer_care(
        consumer_care
    ):

        checks.append({
            "field": "consumer_care",
            "status": "FAIL",
            "message": "Consumer care contact appears invalid"
        })

        violations.append({
            "rule_id": "LM-CONSUMER_CARE-FORMAT",
            "field": "consumer_care",
            "severity": "MEDIUM",
            "message": "Consumer care contact format appears invalid",
            "confidence": confidence_data.get("consumer_care"),
            "confidence_level": get_confidence_level(
                confidence_data.get("consumer_care")
            ),
            "bounding_box": bounding_boxes.get("consumer_care")
        })

    # --------------------------------------------------
    # Overall compliance status
    # --------------------------------------------------

    overall_status = (
        "COMPLIANT"
        if len(violations) == 0
        else "NON_COMPLIANT"
    )

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------

    passed_checks = sum(
        1
        for check in checks
        if check["status"] == "PASS"
    )

    failed_checks = sum(
        1
        for check in checks
        if check["status"] == "FAIL"
    )

    summary = {
        "total_checks": len(checks),
        "passed_checks": passed_checks,
        "failed_checks": failed_checks,
        "total_violations": len(violations)
    }

    # --------------------------------------------------
    # Final response
    # --------------------------------------------------

    return {
        "overall_status": overall_status,
        "checks": checks,
        "violations": violations,
        "summary": summary
    }
