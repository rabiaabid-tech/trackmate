from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models, schemas
from app.auth_utils import create_access_token, verify_google_id_token
from app.deps import require_admin

router = APIRouter(prefix="/auth", tags=["auth"])

# Data model for incoming JSON
class GoogleAuthRequest(BaseModel):
    id_token_str: str

@router.post("/google", response_model=schemas.UserLoginResponse)
def google_sign_in(request_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    # 1. Extract token from Body
    token = request_data.id_token_str
    
    # 2. Verify Google Token
    try:
        # Is function mein apni VITE_GOOGLE_CLIENT_ID lazmi check karein
        idinfo = verify_google_id_token(token)
    except Exception as e:
        # Agar yahan error aaye toh terminal par exact wajah dikhayega
        print(f"GOOGLE VERIFICATION ERROR: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid Google Token. Please try again."
        )

    # 3. Check Domain (@uog.edu.pk)
    email = idinfo.get("email")
    if not email or not email.endswith("@uog.edu.pk"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access restricted. Only @uog.edu.pk emails are allowed."
        )

    # 4. Database Logic (Create or Update)
    google_id = idinfo.get("sub")
    full_name = idinfo.get("name")
    picture = idinfo.get("picture")

    user = db.query(models.User).filter(models.User.email == email).first()
    is_super_admin = True if email == "24017156-035@uog.edu.pk" else False
    if not user:
        user = models.User(
            full_name=full_name, 
            email=email, 
            google_id=google_id, 
            picture_url=picture,
            is_admin=is_super_admin,
            is_active=True
        )
        db.add(user)
    else:
        user.picture_url = picture
        user.full_name = full_name
        if is_super_admin and not user.is_admin:
            user.is_admin = True
    
    db.commit()
    db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account blocked by Admin.")

    # 5. Generate Access Token
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "google_id": user.google_id,
        "picture_url": user.picture_url,
        "is_admin": user.is_admin,
        "access_token": access_token,
        "token_type": "bearer"
    }