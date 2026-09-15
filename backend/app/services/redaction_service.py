from typing import List, Dict, Any

def sanitize_content(content: str, findings: List[Dict[str, Any]], decision: str) -> str:
    if decision == "BLOCK":
        return "[BLOCKED BY LEAKGUARD AI GATEWAY - CONTAINS CRITICAL SECURITY THREATS]"
        
    if not findings or decision == "ALLOW":
        return content
        
    sanitized = content
    # Sort findings by raw_match length descending to replace larger matches first
    sorted_findings = sorted(findings, key=lambda f: len(f.get("raw_match", "")), reverse=True)
    
    for f in sorted_findings:
        raw = f.get("raw_match")
        category = f.get("category", "SENSITIVE_DATA")
        if raw and raw in sanitized:
            placeholder = f"[REDACTED_{category}]"
            sanitized = sanitized.replace(raw, placeholder)
            
    return sanitized
