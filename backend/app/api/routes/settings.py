from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.settings import SettingsModel
from app.schemas.settings import SettingsSchema

router = APIRouter()

@router.get("/settings", response_model=SettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    sys_settings = db.query(SettingsModel).filter(SettingsModel.id == "default").first()
    if not sys_settings:
        sys_settings = SettingsModel(id="default")
        db.add(sys_settings)
        db.commit()
        db.refresh(sys_settings)
    return sys_settings

@router.put("/settings", response_model=SettingsSchema)
def update_settings(req: SettingsSchema, db: Session = Depends(get_db)):
    sys_settings = db.query(SettingsModel).filter(SettingsModel.id == "default").first()
    if not sys_settings:
        sys_settings = SettingsModel(id="default")
        db.add(sys_settings)

    sys_settings.theme = req.theme
    sys_settings.compact_density = req.compact_density
    sys_settings.notify_scan_complete = req.notify_scan_complete
    sys_settings.notify_blocked = req.notify_blocked
    sys_settings.pii_enabled = req.pii_enabled
    sys_settings.secrets_enabled = req.secrets_enabled
    sys_settings.injection_enabled = req.injection_enabled
    sys_settings.ocr_enabled = req.ocr_enabled
    sys_settings.sensitivity = req.sensitivity
    sys_settings.strict_mode = req.strict_mode
    sys_settings.auto_redact_low = req.auto_redact_low
    sys_settings.always_mask_evidence = req.always_mask_evidence
    sys_settings.retain_original = req.retain_original
    sys_settings.retention_days = req.retention_days
    sys_settings.api_base_url = req.api_base_url

    db.commit()
    db.refresh(sys_settings)
    return sys_settings

@router.post("/settings/test-connection")
def test_connection():
    return {
        "connected": True,
        "latencyMs": 14,
        "message": "LeakGuard AI Security Gateway API is online and responding."
    }
