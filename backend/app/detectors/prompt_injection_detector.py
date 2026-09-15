import re
from typing import List, Dict, Any

INJECTION_PATTERNS = [
    {
        "name": "Instruction Override",
        "pattern": r"(?i)(ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions|disregard\s+prior\s+prompts|forget\s+all\s+rules|override\s+(?:system\s+)?prompt|bypass\s+(?:system\s+)?directives)",
        "category": "PROMPT_INJECTION",
        "severity": "High",
        "confidence": 0.95,
        "explanation": "Attempted instruction hierarchy override detected.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "System Prompt Extraction",
        "pattern": r"(?i)(reveal\s+(?:your\s+)?system\s+prompt|repeat\s+the\s+words\s+above|print\s+developer\s+instructions|show\s+initial\s+instructions|exfiltrate\s+system\s+prompt|what\s+are\s+your\s+hidden\s+instructions)",
        "category": "SYSTEM_PROMPT_EXTRACTION",
        "severity": "High",
        "confidence": 0.92,
        "explanation": "System prompt extraction attempt detected.",
        "recommended_action": "WARN"
    },
    {
        "name": "Jailbreak Roleplay (DAN)",
        "pattern": r"(?i)(you\s+are\s+now\s+in\s+DAN\s+mode|dan\s+mode\s+enabled|free\s+from\s+(?:all\s+)?ethical\s+restrictions|do\s+anything\s+now|act\s+as\s+an?\s+(?:unfiltered|unrestricted)\s+ai|disregard\s+(?:all\s+)?safety\s+guidelines|bypass\s+safety\s+filter|developer\s+mode\s+enabled|jailbreak\s+mode)",
        "category": "SUSPICIOUS_INSTRUCTIONS",
        "severity": "High",
        "confidence": 0.94,
        "explanation": "Jailbreak persona or safety filter bypass attempt detected.",
        "recommended_action": "BLOCK"
    },
    {
        "name": "Suspicious System Directive",
        "pattern": r"(?i)(exfiltrate\s+data\s+to|curl\s+-X\s+POST|eval\(base64_decode|wget\s+http|\/etc\/passwd|cmd\.exe\s+\/c)",
        "category": "SUSPICIOUS_INSTRUCTIONS",
        "severity": "High",
        "confidence": 0.90,
        "explanation": "Suspicious execution command or network exfiltration attempt detected.",
        "recommended_action": "BLOCK"
    }
]

def scan_prompt_injection(content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()
    for rule in INJECTION_PATTERNS:
        compiled = re.compile(rule["pattern"])
        for idx, line in enumerate(lines, 1):
            for match in compiled.finditer(line):
                val = match.group(0)
                findings.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "detector": f"Prompt Security Analyzer ({rule['name']})",
                    "masked_evidence": val,
                    "raw_match": val,
                    "explanation": rule["explanation"],
                    "recommended_action": rule["recommended_action"],
                    "line_number": idx,
                    "location": f"Line {idx}, Col {match.start()+1}-{match.end()}"
                })
    return findings
