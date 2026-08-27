import json

from rule_engine.engine.compliance_engine import check_compliance


with open("rule_engine/tests/sample_input.json", "r") as file:
    data = json.load(file)


result = check_compliance(data)

print(json.dumps(result, indent=4))
