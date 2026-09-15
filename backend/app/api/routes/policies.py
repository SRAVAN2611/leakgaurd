from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.policy import PolicyModel
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicySchema

router = APIRouter()

@router.get("/policies", response_model=List[PolicySchema])
def list_policies(db: Session = Depends(get_db)):
    return db.query(PolicyModel).order_by(PolicyModel.created_at.desc()).all()

@router.post("/policies", response_model=PolicySchema)
def create_policy(req: PolicyCreate, db: Session = Depends(get_db)):
    pol = PolicyModel(
        name=req.name,
        description=req.description,
        category=req.category,
        severity=req.severity,
        action=req.action,
        enabled=req.enabled
    )
    db.add(pol)
    db.commit()
    db.refresh(pol)
    return pol

@router.put("/policies/{policy_id}", response_model=PolicySchema)
def update_policy(policy_id: str, req: PolicyUpdate, db: Session = Depends(get_db)):
    pol = db.query(PolicyModel).filter(PolicyModel.id == policy_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")

    if req.name is not None: pol.name = req.name
    if req.description is not None: pol.description = req.description
    if req.category is not None: pol.category = req.category
    if req.severity is not None: pol.severity = req.severity
    if req.action is not None: pol.action = req.action
    if req.enabled is not None: pol.enabled = req.enabled

    db.commit()
    db.refresh(pol)
    return pol

@router.delete("/policies/{policy_id}")
def delete_policy(policy_id: str, db: Session = Depends(get_db)):
    pol = db.query(PolicyModel).filter(PolicyModel.id == policy_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(pol)
    db.commit()
    return {"message": "Policy deleted successfully", "id": policy_id}

@router.patch("/policies/{policy_id}/status", response_model=PolicySchema)
def toggle_policy_status(policy_id: str, db: Session = Depends(get_db)):
    pol = db.query(PolicyModel).filter(PolicyModel.id == policy_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")
    pol.enabled = not pol.enabled
    db.commit()
    db.refresh(pol)
    return pol
