from typing import List, Dict, Any, Tuple

SEVERITY_WEIGHTS = {
    "Critical": 45,
    "High": 25,
    "Medium": 15,
    "Low": 5
}

def calculate_risk_score(findings: List[Dict[str, Any]], strict_mode: bool = False, sensitivity: int = 75) -> Tuple[int, str]:
    if not findings:
        return 0, "Low"
        
    raw_score = 0
    sensitivity_factor = sensitivity / 75.0

    has_critical = any(f.get("severity") == "Critical" for f in findings)
    has_high = any(f.get("severity") == "High" for f in findings)
    
    for f in findings:
        weight = SEVERITY_WEIGHTS.get(f.get("severity", "Low"), 5)
        confidence = f.get("confidence", 1.0)
        raw_score += weight * confidence * sensitivity_factor
        
    if strict_mode:
        raw_score += 15

    # Enforce minimum baseline floor for Critical/High findings
    if has_critical:
        raw_score = max(raw_score, 75)
    elif has_high:
        raw_score = max(raw_score, 50)
        
    final_score = min(100, int(round(raw_score)))
    
    if final_score >= 75:
        severity = "Critical"
    elif final_score >= 50:
        severity = "High"
    elif final_score >= 25:
        severity = "Medium"
    else:
        severity = "Low"
        
    return final_score, severity
