import re
from typing import List, Dict, Any

JWT_PATTERN = r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"

def scan_jwt(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()
    compiled = re.compile(JWT_PATTERN)
    
    for idx, line in enumerate(lines, 1):
        for match in compiled.finditer(line):
            val = match.group(0)
            findings.append({
                "category": "JWT_TOKENS",
                "severity": "High",
                "confidence": 0.98,
                "detector": "JWT Token Scanner",
                "masked_evidence": f"eyJ***.{val.split('.')[1][:6]}***.[SIGNATURE]",
                "raw_match": val,
                "explanation": "Detected JSON Web Token (JWT) bearer credential structure.",
                "recommended_action": "REDACT",
                "line_number": idx,
                "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
            })
    return findings
