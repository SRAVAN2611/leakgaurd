from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.finding import FindingModel

router = APIRouter()

THREAT_DEFINITIONS = {
    "PII": {
        "title": "Personally Identifiable Information (PII)",
        "description": "Sensitive customer or employee data like SSNs, emails, phone numbers, and addresses.",
        "whyDangerous": "Exposing PII leads to severe privacy violations, identity theft, and GDPR/CCPA regulatory fines.",
        "detectionMethodology": "Regex heuristics, contextual named entity recognition, and checksum validation.",
        "recommendedAction": "Redact or mask before transmitting to LLM endpoints."
    },
    "API_KEYS": {
        "title": "API Keys & Access Tokens",
        "description": "Authentication secrets for cloud platforms (AWS, Stripe, GitHub, OpenAI).",
        "whyDangerous": "Leaked keys allow adversaries to hijack infrastructure, read private repositories, or run up compute bills.",
        "detectionMethodology": "Pattern signatures, prefix matching (e.g. ghp_, sk_live), and Shannon entropy heuristics.",
        "recommendedAction": "Block request immediately and revoke compromised keys."
    },
    "CREDENTIALS": {
        "title": "Hardcoded Credentials",
        "description": "Usernames, service keys, and access passwords embedded in prompts or scripts.",
        "whyDangerous": "Allows unauthorized access to corporate applications and backend services.",
        "detectionMethodology": "Contextual proximity analysis around password keys and high-entropy secret assignment.",
        "recommendedAction": "Block transmission and move secrets to a secure key vault."
    },
    "PROMPT_INJECTION": {
        "title": "Prompt Injection Attacks",
        "description": "Adversarial prompts designed to bypass model safety guardrails or hijack control flow.",
        "whyDangerous": "Can manipulate model logic, compromise system integrity, or execute malicious instructions.",
        "detectionMethodology": "Instruction override pattern matching and adversarial heuristic classifiers.",
        "recommendedAction": "Block input and log security alert for SOC inspection."
    },
    "SYSTEM_PROMPT_EXTRACTION": {
        "title": "System Prompt Extraction",
        "description": "Attempts to exfiltrate proprietary system instructions or internal AI persona guidelines.",
        "whyDangerous": "Exposes proprietary business rules, corporate intellectual property, and internal constraints.",
        "detectionMethodology": "Extraction phrase signature matching and contextual intention scoring.",
        "recommendedAction": "Warn or block input based on strictness policy."
    }
}

@router.get("/threats")
def get_threat_categories(db: Session = Depends(get_db)):
    findings = db.query(FindingModel).all()
    counts = {}
    for f in findings:
        counts[f.category] = counts.get(f.category, 0) + 1

    result = []
    for cat_key, meta in THREAT_DEFINITIONS.items():
        result.append({
            "id": cat_key,
            "category": cat_key,
            "count": counts.get(cat_key, 0),
            **meta
        })
    return result

@router.get("/threats/{category}")
def get_threat_category_detail(category: str, db: Session = Depends(get_db)):
    findings = db.query(FindingModel).filter(FindingModel.category == category.upper()).all()
    meta = THREAT_DEFINITIONS.get(category.upper(), {
        "title": category.replace("_", " ").title(),
        "description": "Security threat category monitored by LeakGuard Gateway.",
        "whyDangerous": "Poses security or compliance risks if passed to external AI services.",
        "detectionMethodology": "Deterministic pattern matching & contextual analysis.",
        "recommendedAction": "Review findings and enforce appropriate redaction or block policy."
    })

    return {
        "category": category.upper(),
        "count": len(findings),
        **meta,
        "recentFindings": [
            {
                "id": f.id,
                "scan_id": f.scan_id,
                "severity": f.severity,
                "confidence": f.confidence,
                "detector": f.detector,
                "masked_evidence": f.masked_evidence,
                "explanation": f.explanation,
                "recommended_action": f.recommended_action
            } for f in findings[-10:]
        ]
    }
