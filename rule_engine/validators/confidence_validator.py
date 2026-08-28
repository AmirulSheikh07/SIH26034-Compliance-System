def get_confidence_level(confidence):

    if not isinstance(confidence, (int, float)):
        return "UNKNOWN"

    if confidence >= 0.90:
        return "HIGH"

    if confidence >= 0.70:
        return "MEDIUM"

    return "LOW"
