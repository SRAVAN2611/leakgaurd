import re
import math
from typing import List, Dict, Any

SECRET_PATTERNS = [
    {
        "name": "AWS Access Key ID",
        "pattern": r"(?i)\b(AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b|(?:aws\s*api\s*key|aws\s*access\s*key|aws\s*key|aki[a0o])[:=\s]*([a-zA-Z0-9_]{6,32})",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.99,
        "explanation": "Detected an AWS Access Key ID.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "AWS Secret Key",
        "pattern": r"(?i)aws_secret_access_key\s*[:=]\s*['\"]?([A-Za-z0-9/+=]{40})['\"]?",
        "category": "CREDENTIALS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected an AWS Secret Access Key assignment.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "GitHub Personal Access Token",
        "pattern": r"\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,99}\b",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.99,
        "explanation": "Detected a GitHub Personal Access Token.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Stripe Secret Key",
        "pattern": r"(?i)\brk_(live|test)_[0-9a-zA-Z]{24,99}\b|\bsk_(live|test|dummy)_[0-9a-zA-Z]{24,99}\b|\bstripe_sec_key_[0-9a-zA-Z_]{16,99}\b|(?:stripe|stfipe|sttipe)\s*(?:sec|secret|stripe)?\s*(?:key)?[^a-zA-Z0-9]*([a-zA-Z0-9_]{6,40})",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.99,
        "explanation": "Detected a Stripe Secret API Key.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Confidential Infrastructure Logs",
        "pattern": r"(?i)confi[a-z]*\s+infrastruc[a-z]*\s+logs",
        "category": "SECRETS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected exposure of confidential infrastructure logs containing sensitive security parameters.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "OpenAI API Key",
        "pattern": r"\bsk-[A-Za-z0-9]{32,48}\b|\bsk-proj-[A-Za-z0-9_-]{40,128}\b",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected an OpenAI API Key.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Slack API Token",
        "pattern": r"\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*\b",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected a Slack API Token.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Google Cloud API Key",
        "pattern": r"\bAIzaSy[A-Za-z0-9_-]{33}\b",
        "category": "API_KEYS",
        "severity": "Critical",
        "confidence": 0.98,
        "explanation": "Detected a Google Cloud Platform API Key.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Generic High-Entropy API Token",
        "pattern": r"(?i)(api[_-]?key|access[_-]?token|bearer[_-]?token)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-]{24,128})['\"]?",
        "category": "API_KEYS",
        "severity": "High",
        "confidence": 0.92,
        "explanation": "Detected generic API key credential assignment.",
        "recommended_action": "BLOCK"
    }
]

def shannon_entropy(s: str) -> float:
    if not s: return 0.0
    prob = [float(s.count(c)) / len(s) for c in set(s)]
    return -sum([p * math.log(p, 2) for p in prob])

def scan_secrets(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for rule in SECRET_PATTERNS:
        compiled = re.compile(rule["pattern"])
        for idx, line in enumerate(lines, 1):
            for match in compiled.finditer(line):
                val = match.group(0)
                masked = val[:4] + "..." + val[-4:] if len(val) > 8 else "********"
                findings.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "detector": f"Secret Scanner ({rule['name']})",
                    "masked_evidence": masked,
                    "raw_match": val,
                    "explanation": rule["explanation"],
                    "recommended_action": rule["recommended_action"],
                    "line_number": idx,
                    "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
                })
    return findings
