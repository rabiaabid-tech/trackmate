from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from sqlalchemy.orm import Session
from typing import List
import secrets
import hashlib
import json
from datetime import datetime, timedelta

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user, require_normal_user, require_admin
from app.trust_utils import add_trust_score
from app.core.enum import ClaimStatus

from app.email_utils import send_verification_email, send_finder_contact_info

router = APIRouter(prefix="/claims", tags=["Claims"])

def get_code_hash(code: str) -> str:
    """Helper function to hash the verification code before storing."""
    return hashlib.sha256(code.encode()).hexdigest()

def calculate_fraud_score(db: Session, user_id: int) -> int:
    score = 0
    recent_claims = db.query(models.Claim).filter(
        models.Claim.claimant_id == user_id,
        models.Claim.created_at >= datetime.utcnow() - timedelta(days=7)
    ).count()
    if recent_claims >= 3:
        score += 30
    rejected = db.query(models.Claim).filter(
        models.Claim.claimant_id == user_id,
        models.Claim.status == ClaimStatus.rejected
    ).count()
    if rejected >= 2:
        score += 40
    return min(score, 100)


# 1. CREATE CLAIM (Request Approval)

@router.post("/", response_model=schemas.ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(
    in_data: schemas.ClaimCreate, 
    background_tasks: BackgroundTasks, # 🚨 Added BackgroundTasks for emails
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_normal_user)
):
    if current_user.is_flagged:
        raise HTTPException(status_code=403, detail="⚠️ Your account is flagged for suspicious activity.")
    
    lost = db.query(models.LostItem).filter(models.LostItem.id == in_data.lost_item_id).first()
    found = db.query(models.FoundItem).filter(models.FoundItem.id == in_data.found_item_id).first()

    if not lost or not found:
        raise HTTPException(status_code=400, detail="Invalid Item IDs provided.")

    if found.user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Operation not allowed on your own found item.")
    
    existing_claim = db.query(models.Claim).filter(
        models.Claim.found_item_id == in_data.found_item_id,
        models.Claim.claimant_id == current_user.id,
        models.Claim.deleted_at.is_(None),
        models.Claim.status.in_([ClaimStatus.pending_approval, ClaimStatus.awaiting_verification, ClaimStatus.verified])
    ).first()

    if existing_claim:
        raise HTTPException(status_code=400, detail="You have already submitted a claim for this item.")

    fraud_score = calculate_fraud_score(db, current_user.id)
    is_suspicious = fraud_score >= 60

    if fraud_score >= 80:
        raise HTTPException(status_code=403, detail="Suspicious activity detected. Claim blocked.")

    # Safe serialization
    if isinstance(in_data.ownership_proof, dict):
        safe_proof = in_data.ownership_proof
    elif hasattr(in_data.ownership_proof, "model_dump"):
        safe_proof = in_data.ownership_proof.model_dump()
    elif hasattr(in_data.ownership_proof, "dict"):
        safe_proof = in_data.ownership_proof.dict()
    else:
        safe_proof = str(in_data.ownership_proof)

    new_claim = models.Claim(
        lost_item_id=in_data.lost_item_id,
        found_item_id=in_data.found_item_id,
        claimant_id=current_user.id,
        finder_id=found.user_id,
        status=ClaimStatus.pending_approval,
        justification=in_data.justification,
        ownership_answers=json.dumps(safe_proof), 
        fraud_score=fraud_score,
        is_suspicious=is_suspicious
    )
    
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    # EMAIL FINDER: Notify them that someone claimed their item
    finder_user = db.query(models.User).filter(models.User.id == found.user_id).first()
    if finder_user and finder_user.email:
        pass
        # background_tasks.add_task(
        #     send_new_claim_alert, 
        #     finder_user.email, 
        #     found.item_name, 
        #     current_user.full_name or current_user.username
        # )

    return new_claim 


# 2. LIST CLAIMS (Dashboard)

@router.get("/", response_model=List[schemas.ClaimResponse])
def list_my_claims(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    claims = db.query(models.Claim).filter(
        ((models.Claim.claimant_id == current_user.id) | (models.Claim.finder_id == current_user.id)),
        models.Claim.deleted_at.is_(None)
    ).order_by(models.Claim.created_at.desc()).all()
    return claims


# 3. APPROVE CLAIM (Finder Action)

@router.put("/{claim_id}/approve")
async def approve_claim(
    claim_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_normal_user)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id, models.Claim.deleted_at.is_(None)).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    
    if claim.secure_code_hash is not None:
        raise HTTPException(status_code=400, detail="Verification code already sent.")

    if claim.finder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized action.")

    plain_code = secrets.token_hex(3).upper() 
    hashed_code = get_code_hash(plain_code)

    claim.secure_code_hash = hashed_code
    claim.status = ClaimStatus.awaiting_verification
    claim.verification_sent_at = datetime.utcnow()
    db.add(claim)
    db.commit()

    claimant = db.query(models.User).filter(models.User.id == claim.claimant_id).first()
    item_name = claim.found_item.item_name if claim.found_item else "Found Item"

    # SMART CONTACT EXTRACTION: Extracted safely, defaults to None if not provided
    finder_contact = claim.found_item.contact if claim.found_item else None
    claimant_contact = claim.lost_item.contact if claim.lost_item else None

    # Send OTP to Claimant (with finder contact)
    background_tasks.add_task(
        send_verification_email, 
        email_to=claimant.email, 
        code=plain_code, 
        item_name=item_name, 
        finder_name=current_user.full_name or current_user.username,
        finder_contact=finder_contact
    )

    # Send Next Steps info to Finder (with claimant contact)
    background_tasks.add_task(
        send_finder_contact_info,
        email_to=current_user.email,
        item_name=item_name,
        claimant_email=claimant.email,
        claimant_contact=claimant_contact
    )
    
    return {"message": "Claim approved. Verification code sent to claimant."}


# 4. REJECT CLAIM (Finder Action)

@router.put("/{claim_id}/reject")
def reject_claim(claim_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_normal_user)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id, models.Claim.deleted_at.is_(None)).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if claim.finder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized action.")

    claim.status = ClaimStatus.rejected
    db.add(claim)
    
    rejected_count = db.query(models.Claim).filter(
        models.Claim.claimant_id == claim.claimant_id,
        models.Claim.status == ClaimStatus.rejected
    ).count()

    if rejected_count >= 3:
        claimant_user = db.query(models.User).filter(models.User.id == claim.claimant_id).first()
        claimant_user.is_flagged = True

    db.commit()
    return {"message": "Claim rejected."}


# 5. VERIFY CODE (Final Handover)

@router.post("/{claim_id}/verify")
def verify_claim_code(
    claim_id: int, 
    code: str = Body(..., embed=True), # 🚨 SECURED: OTP is now sent in the request body, not the URL
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_normal_user)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id, models.Claim.deleted_at.is_(None)).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if claim.status != ClaimStatus.awaiting_verification:
        raise HTTPException(status_code=400, detail="Claim is not ready for verification.")
    if claim.finder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the finder can verify the code.")

    if get_code_hash(code) != claim.secure_code_hash:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    claim.status = ClaimStatus.verified
    if claim.found_item:
        claim.found_item.is_active = False
    if claim.lost_item:
        claim.lost_item.is_active = False

    db.add(claim)
    db.commit()

    # Reward system triggers automatically here!
    add_trust_score(db, claim.claimant_id, 10) 
    add_trust_score(db, claim.finder_id, 15)   

    return {"message": "Verification successful. Item marked as returned."}


# 6. ADMIN OVERSIGHT

@router.put("/{claim_id}/status", dependencies=[Depends(require_admin)])
def admin_update_claim_status(claim_id: int, status: ClaimStatus, db: Session = Depends(get_db)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id, models.Claim.deleted_at.is_(None)).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
        
    claim.status = status
    db.commit()
    if status == ClaimStatus.rejected:
        add_trust_score(db, claim.claimant_id, -5)
        
    return {"message": f"Claim status updated to {status}."}