#app/router/trust.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin
from app.trust_utils import add_trust_score
from sqlalchemy import desc
from typing import List

router = APIRouter(prefix="/trust", tags=["Trust Score"])

@router.get("/leaderboard", response_model=List[schemas.TrustScoreResponse])
def get_top_finders(db: Session = Depends(get_db)):
    """
    Public Endpoint: show Top 10 users who has top score
    """
    # Join TrustScore with User table to get details
    top_users = (
        db.query(models.TrustScore)
        .join(models.User)
        .order_by(desc(models.TrustScore.score)) # high score
        .limit(10) # Top 10
        .all()
    )
    
    return top_users

@router.get("/me", response_model=schemas.TrustScoreResponse)
def get_my_trust_score(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve the trust score of the currently logged-in user.
    """
    score = db.query(models.TrustScore).filter(models.TrustScore.user_id == current_user.id).first()

    if not score:
        score = add_trust_score(db, current_user.id, 0)

    return score


@router.get("/{user_id}", response_model=schemas.TrustScoreResponse, dependencies=[Depends(require_admin)])
def get_user_trust_score(user_id: int, db: Session = Depends(get_db)):
    """
    Admin only: Retrieve trust score of a specific user by ID.
    """
    score = db.query(models.TrustScore).filter(models.TrustScore.user_id == user_id).first()

    if not score:
        score = add_trust_score(db, user_id, 0)

    return score


@router.post("/update/{user_id}", response_model=schemas.TrustScoreResponse, dependencies=[Depends(require_admin)])
def update_trust_score(
    user_id: int,
    data: schemas.TrustScoreUpdate,
    db: Session = Depends(get_db)
):
    """
    Admin only: Manually update (increase/decrease) a user's trust score.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    score = add_trust_score(db, user_id, data.value)
    return score

