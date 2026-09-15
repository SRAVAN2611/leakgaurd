from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class FindingBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    category: str
    severity: str
    confidence: float = 1.0
    detector: str
    masked_evidence: str = Field(..., alias="maskedEvidence", serialization_alias="maskedEvidence")
    explanation: str
    recommended_action: Optional[str] = Field(None, alias="recommendedAction", serialization_alias="recommendedAction")
    location: Optional[str] = None
    line_number: Optional[int] = Field(None, alias="line", serialization_alias="line")

class FindingCreate(FindingBase):
    pass

class FindingSchema(FindingBase):
    id: str
    scan_id: str
