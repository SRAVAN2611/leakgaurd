from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.finding import FindingSchema

class TextScanRequest(BaseModel):
    content: str
    source: Optional[str] = "USER_TYPED"

class CodeScanRequest(BaseModel):
    content: str
    language: Optional[str] = "javascript"
    source: Optional[str] = "FILE_UPLOAD"

class ImageScanRequest(BaseModel):
    fileName: Optional[str] = "uploaded_image.png"
    base64: Optional[str] = None
    extractedText: Optional[str] = None

class ScanResponse(BaseModel):
    id: str
    timestamp: str
    inputType: str
    source: str
    threatCount: int
    riskScore: int
    severity: str
    decision: str
    processingTimeMs: int
    findings: List[FindingSchema] = []
    original: Optional[str] = None
    sanitized: Optional[str] = None
    extractedText: Optional[str] = None
    imageUrl: Optional[str] = None
    decisionReason: Optional[str] = None
    matchedPolicies: List[str] = []

    class Config:
        from_attributes = True

class ScanListResponse(BaseModel):
    items: List[ScanResponse]
    total: int
    page: int
    pageSize: int
