from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.policy import PolicyModel

ACTION_PRECEDENCE = {
    "BLOCK": 4,
    "REDACT": 3,
    "WARN": 2,
    "ALLOW": 1
}

def evaluate_policies(db: Session, findings: List[Dict[str, Any]], risk_score: int, severity: str) -> Tuple[str, str, List[str]]:
    active_policies = db.query(PolicyModel).filter(PolicyModel.enabled == True).all()
    
    matched_policy_names = []
    highest_action = "ALLOW"
    reasons = []

    if not findings and risk_score < 25:
        return "ALLOW", "No threats detected. Content complies with all active security policies.", []

    for policy in active_policies:
        matched = False
        
        # Category matching
        cat_match = policy.category == "ALL" or any(f.get("category") == policy.category for f in findings)
        sev_match = False
        
        # Severity hierarchy matching
        if policy.category != "ALL" and any(f.get("category") == policy.category for f in findings):
            # Category-specific policy matches any finding in its target category
            sev_match = True
        elif policy.severity == "Low":
            sev_match = True
        elif policy.severity == "Medium" and severity in ["Medium", "High", "Critical"]:
            sev_match = True
        elif policy.severity == "High" and severity in ["High", "Critical"]:
            sev_match = True
        elif policy.severity == "Critical" and severity == "Critical":
            sev_match = True

            
        if cat_match and sev_match:
            matched = True
            
        if matched:
            matched_policy_names.append(policy.name)
            if ACTION_PRECEDENCE.get(policy.action, 1) > ACTION_PRECEDENCE.get(highest_action, 1):
                highest_action = policy.action
                reasons.append(f"Triggered policy '{policy.name}' ({policy.action}) for category {policy.category}.")

    if highest_action == "ALLOW" and (findings or risk_score >= 25):
        highest_action = "WARN" if risk_score < 75 else "BLOCK"
        reasons.append(f"Default risk threshold precedence applied ({severity} severity, Risk {risk_score}).")

    final_reason = " ".join(reasons) if reasons else f"Policy evaluation completed with final decision: {highest_action}."
    return highest_action, final_reason, matched_policy_names
