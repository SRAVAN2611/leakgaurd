from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from datetime import datetime, timezone
import uuid
from app.core.database import Base

def generate_scan_id():
    return f"sc_{uuid.uuid4().hex[:8]}"

class ScanModel(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=generate_scan_id)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    input_type = Column(String, nullable=False) # 'Text', 'Code', 'Image'
    source = Column(String, nullable=False) # 'USER_TYPED', 'PASTED_TEXT', 'EXTERNAL_CONTENT', 'FILE_UPLOAD', 'IMAGE_OCR'
    threat_count = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    severity = Column(String, default="Low") # 'Low', 'Medium', 'High', 'Critical'
    decision = Column(String, default="ALLOW") # 'ALLOW', 'WARN', 'REDACT', 'BLOCK'
    processing_time_ms = Column(Integer, default=0)
    original_content = Column(Text, nullable=True)
    sanitized_content = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    language = Column(String, nullable=True)
    decision_reason = Column(Text, nullable=True)
    matched_policies = Column(JSON, default=list)
