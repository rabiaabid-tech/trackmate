# app/router/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from pydantic import BaseModel
from app.deps import require_admin, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# User Status Update Schema

class UserStatusUpdate(BaseModel):
    is_blocked: bool


# Admin: Get All Users (SECURE)

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    
    # Format response to match frontend expectations
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "trust_score": getattr(u, "trust_score", 0),
            "is_blocked": not getattr(u, "is_active", True), # active means not blocked
            "is_admin": getattr(u, "is_admin", False),       # sending admin status
            "is_flagged": getattr(u, "is_flagged", False)     # sending flagged status
        }
        for u in users
    ]


# Admin: Block/Unblock User

@router.patch("/admin/users/{target_user_id}/block")
def toggle_user_block_status(
    target_user_id: int, 
    payload: UserStatusUpdate,
    db: Session = Depends(get_db), 
    current_admin: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.is_admin:
         raise HTTPException(status_code=403, detail="Cannot block another admin")

    # If is_blocked is True, is_active becomes False
    target_user.is_active = not payload.is_blocked
    db.commit()
    
    status_msg = "Blocked" if payload.is_blocked else "Unblocked"
    return {"message": f"User successfully {status_msg}"}


# Get User by ID (Public/Protected)

@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user