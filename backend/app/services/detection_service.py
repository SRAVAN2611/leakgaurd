from typing import List, Dict, Any
from app.detectors.pii_detector import scan_pii
from app.detectors.secret_detector import scan_secrets
from app.detectors.password_detector import scan_passwords
from app.detectors.jwt_detector import scan_jwt
from app.detectors.private_key_detector import scan_private_keys
from app.detectors.database_secret_detector import scan_db_secrets
from app.detectors.prompt_injection_detector import scan_prompt_injection

def run_all_detectors(content: str, pii_enabled: bool = True, secrets_enabled: bool = True, injection_enabled: bool = True) -> List[Dict[str, Any]]:
    findings = []
    
    if pii_enabled:
        findings.extend(scan_pii(content))
        
    if secrets_enabled:
        findings.extend(scan_secrets(content))
        findings.extend(scan_passwords(content))
        findings.extend(scan_jwt(content))
        findings.extend(scan_private_keys(content))
        findings.extend(scan_db_secrets(content))
        
    if injection_enabled:
        findings.extend(scan_prompt_injection(content))
        
    return findings
