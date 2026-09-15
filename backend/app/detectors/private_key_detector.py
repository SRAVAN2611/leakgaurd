import re
from typing import List, Dict, Any

PRIVATE_KEY_PATTERN = r"-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP|TEST_KEY|TEST_RSA)?\s*PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA|DSA|EC|OPENSSH|PGP|TEST_KEY|TEST_RSA)?\s*PRIVATE\s+KEY-----"


def scan_private_keys(content: str) -> List[Dict[str, Any]]:
    findings = []
    compiled = re.compile(PRIVATE_KEY_PATTERN, re.IGNORECASE)
    
    for match in compiled.finditer(content):
        val = match.group(0)
        first_line = val.splitlines()[0] if val.splitlines() else "-----BEGIN PRIVATE KEY-----"
        findings.append({
            "category": "PRIVATE_KEYS",
            "severity": "Critical",
            "confidence": 0.99,
            "detector": "Private Key Scanner",
            "masked_evidence": f"{first_line} ... [ENCRYPTED KEY BODY] ... -----END PRIVATE KEY-----",
            "raw_match": val,
            "explanation": "Detected unencrypted RSA/EC/OpenSSH private key block.",
            "recommended_action": "BLOCK",
            "line_number": 1,
            "location": f"Pos {match.start()}-{match.end()}"
        })
    return findings
