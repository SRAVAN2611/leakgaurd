from sqlalchemy import Column, String, Boolean, Integer, JSON
from app.core.database import Base

class SettingsModel(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="default")
    theme = Column(String, default="system") # 'light', 'dark', 'system'
    compact_density = Column(Boolean, default=False)
    notify_scan_complete = Column(Boolean, default=True)
    notify_blocked = Column(Boolean, default=True)
    
    # Detection Toggles
    pii_enabled = Column(Boolean, default=True)
    secrets_enabled = Column(Boolean, default=True)
    injection_enabled = Column(Boolean, default=True)
    ocr_enabled = Column(Boolean, default=True)
    sensitivity = Column(Integer, default=75)
    strict_mode = Column(Boolean, default=False)
    auto_redact_low = Column(Boolean, default=True)
    
    # Privacy
    always_mask_evidence = Column(Boolean, default=True)
    retain_original = Column(Boolean, default=True)
    retention_days = Column(Integer, default=7)
    
    # API Settings
    api_base_url = Column(String, default="http://127.0.0.1:8000/api/v1")
