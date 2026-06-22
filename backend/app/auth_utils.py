# app/auth_utils.py
import os
import time
from typing import Dict, Optional
from jose import jwt # pip install python-jose[cryptography]
from google.oauth2 import id_token # pip install google-auth
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

# SECURITY CONFIGURATION
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")
if not GOOGLE_CLIENT_ID:
    raise RuntimeError("GOOGLE_CLIENT_ID not set")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 Week Expiry

def verify_google_id_token(token: str) -> Dict:
    """
    Google ke servers se token verify karta hai.
    Clock skew fix aur detailed error logging ke sath.
    """
    try:
        request = google_requests.Request()
        # clock_skew_in_seconds 10 adds a buffer for time sync issues
        payload = id_token.verify_oauth2_token(
            token,
            request,
            audience=GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10 
        )
        return payload
    except ValueError as e:
        
        error_msg = f"Google Validation Failed: {str(e)}"
        print(f"CRITICAL ERROR: {error_msg}")
        raise Exception(error_msg)

def create_access_token(data: dict) -> str:
    """
    User ke liye JWT Session Token banata hai.
    """
    to_encode = data.copy()
    expire = int(time.time()) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    
    
    to_encode.update({"exp": expire, "iat": int(time.time())})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt