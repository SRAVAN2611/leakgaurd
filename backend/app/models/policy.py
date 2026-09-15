from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class PolicyModel(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, default=lambda: f"pol_{uuid.uuid4().hex[:8]}")
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False, default="High")
    action = Column(String, nullable=False, default="BLOCK") # 'ALLOW', 'WARN', 'REDACT', 'BLOCK'
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
