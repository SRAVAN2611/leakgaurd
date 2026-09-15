import re
from typing import List, Dict, Any

DB_PATTERNS = [
    {
        "name": "Database Connection String",
        "pattern": r"\b(postgres|postgresql|mysql|mongodb|mongodb\+srv|redis|amqp):\/\/[A-Za-z0-9_%\-]+:([^@\s]+)@[A-Za-z0-9_.\-]+(?::\d+)?\/[A-Za-z0-9_\-]*\b",
        "category": "DATABASE_SECRETS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected database connection string containing plaintext credentials.",
        "recommended_action": "BLOCK"
    }
]

def scan_db_secrets(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()
    for rule in DB_PATTERNS:
        compiled = re.compile(rule["pattern"], re.IGNORECASE)
        for idx, line in enumerate(lines, 1):
            for match in compiled.finditer(line):
                val = match.group(0)
                pass_val = match.group(2)
                masked_str = val.replace(pass_val, "********")
                findings.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "detector": f"Database Secret Scanner ({rule['name']})",
                    "masked_evidence": masked_str,
                    "raw_match": val,
                    "explanation": rule["explanation"],
                    "recommended_action": rule["recommended_action"],
                    "line_number": idx,
                    "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
                })
    return findings
