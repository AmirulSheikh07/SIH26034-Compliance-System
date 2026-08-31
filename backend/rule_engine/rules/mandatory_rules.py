MANDATORY_RULES = [
    {
        "rule_id": "LM-MANUFACTURER",
        "field": "manufacturer",
        "severity": "HIGH",
        "description": "Manufacturer, packer or importer declaration is required"
    },
    {
        "rule_id": "LM-ADDRESS",
        "field": "address",
        "severity": "HIGH",
        "description": "Address declaration is required"
    },
    {
        "rule_id": "LM-MRP",
        "field": "mrp",
        "severity": "HIGH",
        "description": "Maximum Retail Price declaration is required"
    },
    {
        "rule_id": "LM-NET_QUANTITY",
        "field": "net_quantity",
        "severity": "HIGH",
        "description": "Net quantity declaration is required"
    },
    {
        "rule_id": "LM-MANUFACTURING_DATE",
        "field": "manufacturing_date",
        "severity": "HIGH",
        "description": "Month and year of manufacture or packing is required"
    },
    {
        "rule_id": "LM-CONSUMER_CARE",
        "field": "consumer_care",
        "severity": "HIGH",
        "description": "Consumer care details are required"
    },
    {
        "rule_id": "LM-COUNTRY-OF-ORIGIN",
        "field": "country_of_origin",
        "severity": "HIGH",
        "description": "Country of origin declaration is required"
    }
]


MANDATORY_FIELDS = [
    rule["field"] for rule in MANDATORY_RULES
]
