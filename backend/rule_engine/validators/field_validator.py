def is_present(value):
    """
    Check whether a field contains a meaningful value.
    """
    if value is None:
        return False

    if isinstance(value, str) and value.strip() == "":
        return False

    return True
