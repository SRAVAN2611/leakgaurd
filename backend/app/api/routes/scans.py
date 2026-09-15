from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models.scan import ScanModel
from app.models.finding import FindingModel
from app.schemas.scan import TextScanRequest, CodeScanRequest, ImageScanRequest, ScanResponse
from app.schemas.finding import FindingSchema
from app.services.scan_service import execute_scan

router = APIRouter()

def format_scan_response(scan: ScanModel, db: Session) -> dict:
    findings = db.query(FindingModel).filter(FindingModel.scan_id == scan.id).all()
    finding_schemas = [
        FindingSchema(
            id=f.id,
            scan_id=f.scan_id,
            category=f.category,
            severity=f.severity,
            confidence=f.confidence,
            detector=f.detector,
            masked_evidence=f.masked_evidence,
            explanation=f.explanation,
            recommended_action=f.recommended_action,
            location=f.location,
            line_number=f.line_number
        ) for f in findings
    ]

    return {
        "id": scan.id,
        "timestamp": scan.timestamp.isoformat() if scan.timestamp else "",
        "inputType": scan.input_type,
        "source": scan.source,
        "threatCount": scan.threat_count,
        "riskScore": scan.risk_score,
        "severity": scan.severity,
        "decision": scan.decision,
        "processingTimeMs": scan.processing_time_ms,
        "findings": [f.model_dump(by_alias=True) for f in finding_schemas],
        "original": scan.original_content,
        "sanitized": scan.sanitized_content,
        "extractedText": scan.extracted_text,
        "imageUrl": scan.image_url,
        "decisionReason": scan.decision_reason,
        "matchedPolicies": scan.matched_policies or []
    }

@router.post("/scans/text", response_model=ScanResponse)
def scan_text_endpoint(req: TextScanRequest, db: Session = Depends(get_db)):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    scan = execute_scan(db, content=req.content, input_type="Text", source=req.source or "USER_TYPED")
    return format_scan_response(scan, db)

@router.post("/scans/code", response_model=ScanResponse)
def scan_code_endpoint(req: CodeScanRequest, db: Session = Depends(get_db)):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Code content cannot be empty")
    scan = execute_scan(db, content=req.content, input_type="Code", source=req.source or "FILE_UPLOAD", language=req.language or "javascript")
    return format_scan_response(scan, db)

@router.post("/scans/image", response_model=ScanResponse)
def scan_image_endpoint(req: ImageScanRequest, db: Session = Depends(get_db)):
    scan = execute_scan(
        db,
        content=req.extractedText or "",
        input_type="Image",
        source="IMAGE_OCR",
        file_name=req.fileName or "uploaded_image.png",
        base64_data=req.base64
    )
    return format_scan_response(scan, db)

@router.get("/scans")
def list_scans(
    query: Optional[str] = Query(None),
    type: Optional[str] = Query("all"),
    severity: Optional[str] = Query("all"),
    decision: Optional[str] = Query("all"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    q = db.query(ScanModel)
    
    if type and type.lower() != "all":
        q = q.filter(ScanModel.input_type.ilike(type))
    if severity and severity.lower() != "all":
        q = q.filter(ScanModel.severity.ilike(severity))
    if decision and decision.lower() != "all":
        q = q.filter(ScanModel.decision.ilike(decision))
    if query and query.strip():
        search_term = f"%{query.strip()}%"
        q = q.filter((ScanModel.id.ilike(search_term)) | (ScanModel.original_content.ilike(search_term)) | (ScanModel.source.ilike(search_term)))
        
    total = q.count()
    items = q.order_by(ScanModel.timestamp.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    
    return {
        "items": [format_scan_response(s, db) for s in items],
        "total": total,
        "page": page,
        "pageSize": pageSize
    }

@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanModel).filter(ScanModel.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return format_scan_response(scan, db)
