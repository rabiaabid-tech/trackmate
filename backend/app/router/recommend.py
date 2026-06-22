# app/router/recommend.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.ai.minilm import find_best_matches

router = APIRouter(prefix="/recommend", tags=["AI Recommendations"])


@router.get(
    "/lost/{lost_item_id}",
    response_model=List[schemas.FoundItemRecommendation]
)
def recommend_found_items_for_lost(
    lost_item_id: int,
    db: Session = Depends(get_db)
):
    # Fetch Lost Item
    lost_item = (
        db.query(models.LostItem)
        .filter(
            models.LostItem.id == lost_item_id,
            models.LostItem.is_active == True,
            models.LostItem.deleted_at.is_(None)
        )
        .first()
    )

    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    # Narrow candidates (FAST path)
    candidates = (
        db.query(models.FoundItem)
        .filter(
            models.FoundItem.is_active == True,
            models.FoundItem.deleted_at.is_(None),
            models.FoundItem.item_category == lost_item.item_category
        )
        .all()
    )

    if not candidates:
        return []

    # Prepare TEXT for NLP (decoupled)
    query_text = f"{lost_item.item_name} {lost_item.description}"

    candidate_texts = [
        f"{item.item_name} {item.description}"
        for item in candidates
    ]

    matches = find_best_matches(query_text, candidate_texts)

    # Build secure response
    results = []
    for match in matches:
        item = candidates[match["index"]]

        results.append(
            schemas.FoundItemRecommendation(
                id=item.id,
                item_name=item.item_name,
                item_category=item.item_category,
                location=item.location,
                date_found=item.date_found,
                match_score=round(match["score"] * 100, 1)
            )
        )

    return results
