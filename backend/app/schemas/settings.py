from pydantic import BaseModel
from typing import Optional

class SettingsSchema(BaseModel):
    theme: str = "system"
    compact_density: bool = False
    notify_scan_complete: bool = True
    notify_blocked: bool = True
    pii_enabled: bool = True
    secrets_enabled: bool = True
    injection_enabled: bool = True
    ocr_enabled: bool = True
    sensitivity: int = 75
    strict_mode: bool = False
    auto_redact_low: bool = True
    always_mask_evidence: bool = True
    retain_original: bool = True
    retention_days: int = 7
    api_base_url: str = "http://127.0.0.1:8000/api/v1"

    class Config:
        from_attributes = True
