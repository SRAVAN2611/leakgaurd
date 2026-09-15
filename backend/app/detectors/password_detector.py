import re
from typing import List, Dict, Any

PASSWORD_PATTERNS = [
    {
        "name": "Hardcoded Password Assignment",
        "pattern": r"(?i)(password|passwd|pwd|pass|secret_key|db_pass|db_password|app_secret)\s*[:=]\s*['\"]([^'\"]{4,64})['\"]",
        "category": "PASSWORDS",
        "severity": "High",
        "confidence": 0.94,
        "explanation": "Detected hardcoded password or credential assignment.",
        "recommended_action": "REDACT"
    }
]

def scan_passwords(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()
    for rule in PASSWORD_PATTERNS:
        compiled = re.compile(rule["pattern"])
        for idx, line in enumerate(lines, 1):
            for match in compiled.finditer(line):
                full_val = match.group(0)
                secret_val = match.group(2) if match.lastindex >= 2 else full_val
                findings.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "detector": f"Password Scanner ({rule['name']})",
                    "masked_evidence": secret_val[:2] + "********" + secret_val[-1:] if len(secret_val) > 4 else "********",
                    "raw_match": full_val,
                    "explanation": rule["explanation"],
                    "recommended_action": rule["recommended_action"],
                    "line_number": idx,
                    "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
                })
    return findings
