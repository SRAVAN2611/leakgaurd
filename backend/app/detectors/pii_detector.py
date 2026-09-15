import re
from typing import List, Dict, Any

PII_PATTERNS = [
    {
        "name": "Social Security Number (SSN)",
        "pattern": r"\b(?!000|666|9\d{2})\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b",
        "category": "PII",
        "severity": "High",
        "confidence": 0.95,
        "explanation": "Detected a US Social Security Number (SSN) pattern.",
        "recommended_action": "REDACT"
    },
    {
        "name": "Email Address",
        "pattern": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        "category": "PII",
        "severity": "Medium",
        "confidence": 0.98,
        "explanation": "Detected a personal or corporate email address.",
        "recommended_action": "REDACT"
    },
    {
        "name": "Phone Number",
        "pattern": r"\b(?:\+?1[-. ]?)?\(?([2-9]\d{2})\)?[-. ]?([2-9]\d{2})[-. ]?(\d{4})\b",
        "category": "PII",
        "severity": "Medium",
        "confidence": 0.90,
        "explanation": "Detected a phone number pattern.",
        "recommended_action": "REDACT"
    },
    {
        "name": "Credit Card Number",
        "pattern": r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b",
        "category": "PII",
        "severity": "Critical",
        "confidence": 0.96,
        "explanation": "Detected a credit card payment card number pattern.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "IP Address (IPv4)",
        "pattern": r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b",
        "category": "PII",
        "severity": "Low",
        "confidence": 0.85,
        "explanation": "Detected an internal or external IPv4 network address.",
        "recommended_action": "REDACT"
    }
]

def mask_text(match_str: str) -> str:
    if "@" in match_str:
        parts = match_str.split("@")
        user = parts[0]
        masked_user = user[:2] + "***" if len(user) > 2 else "***"
        return f"{masked_user}@{parts[1]}"
    if len(match_str) > 4:
        return match_str[:2] + "*" * (len(match_str) - 4) + match_str[-2:]
    return "****"

def scan_pii(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()
    
    for rule in PII_PATTERNS:
        compiled = re.compile(rule["pattern"], re.IGNORECASE)
        for idx, line in enumerate(lines, 1):
            for match in compiled.finditer(line):
                val = match.group(0)
                # Ignore loopback/broadcast IP false positives
                if rule["name"] == "IP Address (IPv4)" and val in ["127.0.0.1", "0.0.0.0", "255.255.255.255"]:
                    continue
                findings.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "detector": f"PII Detector ({rule['name']})",
                    "masked_evidence": mask_text(val),
                    "raw_match": val,
                    "explanation": rule["explanation"],
                    "recommended_action": rule["recommended_action"],
                    "line_number": idx,
                    "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
                })
    return findings
