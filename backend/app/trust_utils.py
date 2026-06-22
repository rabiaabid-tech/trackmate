# app/trust_utils.py
from sqlalchemy.orm import Session
from app import models

def add_trust_score(db: Session, user_id: int, points: int):
   
    trust_entry = db.query(models.TrustScore).filter(models.TrustScore.user_id == user_id).first()

    
    if not trust_entry:
        trust_entry = models.TrustScore(user_id=user_id, score=0)
        db.add(trust_entry)
       

    trust_entry.score += points
    
    
    db.commit()
    db.refresh(trust_entry)
    
    return trust_entry