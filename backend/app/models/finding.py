from sqlalchemy import Column, String, Float, Integer, ForeignKey
from app.core.database import Base
import uuid

class FindingModel(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, default=lambda: f"f_{uuid.uuid4().hex[:8]}")
    scan_id = Column(String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)
    detector = Column(String, nullable=False)
    masked_evidence = Column(String, nullable=False)
    explanation = Column(String, nullable=False)
    recommended_action = Column(String, nullable=True)
    location = Column(String, nullable=True)
    line_number = Column(Integer, nullable=True)
