from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import asyncio

from app import models, schemas, utils
from app.database import get_db
from app.deps import get_current_user, require_normal_user, require_admin
from app.trust_utils import add_trust_score
from app.core.enum import ItemCategoryEnum
from app.ai.minilm import find_best_matches
# from app.email_utils import send_match_alert_email

router = APIRouter(prefix="/lost", tags=["Lost Items"])

async def run_ai_scan_for_lost_task(db: Session, new_lost_item: models.LostItem, user_email: str):
    candidates = db.query(models.FoundItem).filter(
        models.FoundItem.is_active == True, 
        models.FoundItem.deleted_at.is_(None), 
        models.FoundItem.item_category == new_lost_item.item_category
    ).all()
    
    if not candidates:
        return
        
    query_text = f"{new_lost_item.item_name} {new_lost_item.description}"
    candidate_texts = [f"{item.item_name} {item.description}" for item in candidates]
    
    loop = asyncio.get_event_loop()
    matches = await loop.run_in_executor(None, find_best_matches, query_text, candidate_texts)
    
    for match in matches:
        if match["score"] >= 0.70:
            matched_found_item = candidates[match["index"]]
            # await send_match_alert_email(user_email, new_lost_item.item_name, matched_found_item.id)
            pass  
            break 

@router.post("/", response_model=schemas.LostItemResponse, status_code=status.HTTP_201_CREATED)
def create_lost_item(
    background_tasks: BackgroundTasks,
    item_name: str = Form(...),
    item_category: ItemCategoryEnum = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    contact: Optional[str] = Form(None),
    date_lost: Optional[datetime] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_normal_user)
):
    image_url = None
    if image and image.filename:
        if not image.content_type.startswith("image/"):
            raise HTTPException(400, detail="File must be an image (jpg, png, etc)")
        image_url = utils.save_image(image)

    try:
        validated_data = schemas.LostItemCreate(
            item_name=item_name,
            item_category=item_category,
            location=location,
            description=description,
            contact=contact,
            date_lost=date_lost,
            image_url=image_url 
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    new_item = models.LostItem(
        **validated_data.dict(),
        user_id=current_user.id
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    add_trust_score(db, current_user.id, 1)
    
    background_tasks.add_task(run_ai_scan_for_lost_task, db, new_item, current_user.email)
    return new_item

@router.get("/", response_model=List[schemas.LostItemPublic])
def get_public_lost_items(skip: int = 0, limit: int = 50, q: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    
    query = db.query(models.LostItem) 
    if category:
        query = query.filter(models.LostItem.item_category == category)
    if q:
        search = f"%{q}%"
        query = query.filter((models.LostItem.item_name.ilike(search)) | (models.LostItem.location.ilike(search)))
    return query.order_by(models.LostItem.created_at.desc()).offset(skip).limit(limit).all()

# ADMIN ACCESS TO ALL LOST ITEMS (WITH USER INFO)
@router.get("/admin/all", response_model=List[schemas.LostItemAdmin])
def get_admin_lost_items(db: Session = Depends(get_db), current_admin: models.User = Depends(require_admin)):
    items = db.query(models.LostItem).order_by(models.LostItem.created_at.desc()).all()
    return items

@router.get("/my", response_model=List[schemas.LostItemDetail])
def get_my_lost_items(current_user: models.User = Depends(get_current_user)):
    return current_user.lost_items

@router.get("/{item_id}", response_model=schemas.LostItemDetail)
def get_single_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# --- RESTORED UPDATE ROUTE ---
@router.put("/{item_id}", response_model=schemas.LostItemResponse)
def update_lost_item(
    item_id: int,
    item_name: str = Form(None),
    item_category: Optional[ItemCategoryEnum] = Form(None),
    location: str = Form(None),
    description: str = Form(None),
    contact: Optional[str] = Form(None),
    date_lost: Optional[datetime] = Form(None),
    file: Optional[UploadFile] = File(None), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_normal_user)
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this item")

    data_modified = False

    if file and file.filename:
        new_image_url = utils.save_image(file)
        item.image_url = new_image_url
        data_modified = True

    if item_name: 
        item.item_name = item_name
        data_modified = True
    if item_category: 
        item.item_category = item_category
        data_modified = True
    if location: 
        item.location = location
        data_modified = True
    if description: 
        item.description = description
        data_modified = True
    if contact is not None: 
        item.contact = contact
        data_modified = True
    if date_lost: 
        item.date_lost = date_lost
        data_modified = True
    
    if data_modified:
        item.is_edited = True

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lost_item(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_normal_user)):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_admin and item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    db.delete(item)
    db.commit()
    return None