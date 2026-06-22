import shutil
import uuid
import os
from fastapi import UploadFile

UPLOAD_DIR = "static/images"

def save_image(file: UploadFile) -> str:
    if not file or not file.filename:
        return None
        
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"/static/images/{unique_filename}"