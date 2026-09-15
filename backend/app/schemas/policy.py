from pydantic import BaseModel
from typing import Optional

class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = ""
    category: str
    severity: str = "High"
    action: str = "BLOCK"
    enabled: bool = True

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    action: Optional[str] = None
    enabled: Optional[bool] = None

class PolicySchema(PolicyBase):
    id: str

    class Config:
        from_attributes = True
