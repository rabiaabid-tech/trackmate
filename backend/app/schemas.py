# app/schemas.py
from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional, Annotated
from datetime import datetime
import re
from app.core.enum import ItemCategoryEnum,ClaimStatus, ItemStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    full_name: Optional[str]
    email: EmailStr
    google_id: Optional[str]
    picture_url: Optional[str]


class UserResponse(BaseModel):
    id: int
    full_name: str | None = None
    email: str
    google_id: str | None = None
    picture_url: str | None = None
    is_admin: bool = False
    is_flagged: bool = False

    class Config:
        from_attributes = True


class ReporterInfo(BaseModel):
    id: int
    full_name: Optional[str] = "Unknown"
    email: str

    class Config:
        from_attributes = True


class LostItemBase(BaseModel):
    item_name: Annotated[str, Field(...,min_length=3, max_length=50, description='name of the item that lost')]
    item_category: Annotated[ItemCategoryEnum, Field(..., description='write the category of item', example='electronics,stationary,personal belonging')]
    location: Annotated[str, Field(..., min_length=3, max_length=100, description='where you lost the item')]
    description: Annotated[str, Field(..., min_length=20, max_length=500, description='write unique identity of your item to claim successfull')]
    contact: Optional[str]=Field(None, description='this is optional you can skip it')

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v):
        if not v:
            return v
        
        v_clean = re.sub(r"\D", "", v) 
        if len(v_clean) == 10 and v_clean.startswith("3"):
             v_clean = "92" + v_clean
        elif len(v_clean) == 11 and v_clean.startswith("03"):
             v_clean = "92" + v_clean[1:]
        if len(v_clean) != 12 or not v_clean.startswith("92"):
            raise ValueError("Invalid Phone Number")

        return "+" + v_clean

    image_url: Optional[str] = Field(None, description='upload image if you have')
    date_lost: Optional[datetime] = None


class LostItemCreate(LostItemBase):
    pass

class LostItemUpdate(BaseModel):
    item_name: Optional[str] = None
    item_category: Optional[ItemCategoryEnum] = None
    location: Optional[str] = None
    description: Optional[str] = None
    contact: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[ItemStatus] = None  

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v):
        if not v: return v
        v_clean = re.sub(r"\D", "", v) 
        if len(v_clean) == 10 and v_clean.startswith("3"): v_clean = "92" + v_clean
        elif len(v_clean) == 11 and v_clean.startswith("03"): v_clean = "92" + v_clean[1:]
        if len(v_clean) != 12 or not v_clean.startswith("92"): raise ValueError("Invalid Phone Number")
        return "+" + v_clean

class LostItemPublic(BaseModel):
    id: int
    item_name: str
    item_category: ItemCategoryEnum
    location: str
    date_lost: Optional[datetime]
    created_at: datetime
    status: ItemStatus
    is_active: bool
    is_edited: bool = False

    class Config:
        from_attributes = True


class LostItemDetail(LostItemPublic):
    description: str  
    contact: Optional[str]
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class LostItemResponse(LostItemDetail):
    user_id: Optional[int]
    user: Optional[ReporterInfo] = None 
    class Config:
        from_attributes = True



class FoundItemBase(BaseModel):
    item_name: Annotated[str, Field(...,min_length=3, max_length=50, description='name of the item that you found')]
    item_category: Annotated[ItemCategoryEnum, Field(..., description='write the category of item', example='elctronics,stationary,personal belonging')]
    location: Annotated[str, Field(...,min_length=3, max_length=100, description='where you lost the item')]
    description: Annotated[str, Field(...,min_length=20, max_length=500, description='write unique identity of the item')]
    contact: Optional[str] = Field(None, description='this is optional you can skip it')

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v):
        if not v:
            return v
        
        v_clean = re.sub(r"\D", "", v) 
        if len(v_clean) == 10 and v_clean.startswith("3"):
             v_clean = "92" + v_clean
        elif len(v_clean) == 11 and v_clean.startswith("03"):
             v_clean = "92" + v_clean[1:]
        if len(v_clean) != 12 or not v_clean.startswith("92"):
            raise ValueError("Invalid Phone Number")

        return "+" + v_clean

    image_url: Optional[str] = Field(None, description='upload image if you have')
    date_found: Optional[datetime] = None

class FoundItemCreate(FoundItemBase):
    pass

class FoundItemUpdate(BaseModel):
    item_name: Optional[str] = None
    item_category: Optional[ItemCategoryEnum] = None
    location: Optional[str] = None
    description: Optional[str] = None
    contact: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[ItemStatus] = None
    
    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v):
        if not v: return v
        v_clean = re.sub(r"\D", "", v) 
        if len(v_clean) == 10 and v_clean.startswith("3"): v_clean = "92" + v_clean
        elif len(v_clean) == 11 and v_clean.startswith("03"): v_clean = "92" + v_clean[1:]
        if len(v_clean) != 12 or not v_clean.startswith("92"): raise ValueError("Invalid Phone Number")
        return "+" + v_clean
    
class FoundItemPublic(BaseModel):
    id: int
    item_name: str
    item_category: ItemCategoryEnum
    location: str
    date_found: Optional[datetime]
    created_at: datetime
    status: ItemStatus
    is_active: bool
    is_edited: bool = False

    class Config:
        from_attributes = True

class FoundItemDetail(FoundItemPublic):
    description: str  
    contact: Optional[str]
    image_url: Optional[str] = None 
    
    class Config:
        from_attributes = True


class FoundItemResponse(FoundItemDetail):
    user_id: Optional[int]
    user: Optional[ReporterInfo] = None 
  
    class Config:
        from_attributes = True



class OwnershipProof(BaseModel):
    brand: Optional[str] = Field(None, min_length=2, max_length=50)
    color: Optional[str] = Field(None, min_length=2, max_length=30)
    unique_mark: Optional[str] = Field(
        None,
        min_length=3,
        max_length=100,
        description="Sticker, scratch, name, serial hint etc"
    )

class ClaimCreate(BaseModel):
    lost_item_id: int
    found_item_id: int
    justification: Annotated[
        str,
        Field(
            min_length=30,
            max_length=300,
            description="Explain how this item belongs to you"
        )
    ]
    ownership_proof: OwnershipProof


class ClaimResponse(BaseModel):
    id: int
    lost_item_id: Optional[int]
    found_item_id: Optional[int]
    claimant_id: int
    finder_id: int
    status: ClaimStatus
    created_at: datetime
    justification: str 
    ownership_answers: str
    class Config:
        from_attributes = True


class UserInLeaderboard(BaseModel):
    full_name: Optional[str] = "Unknown User"
    picture_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class TrustScoreResponse(BaseModel):
    id: int
    user_id: int
    score: int
    user: Optional[UserInLeaderboard] = None

    class Config:
        from_attributes = True


class TrustScoreUpdate(BaseModel):
    value: Annotated[int, Field(..., ge=-20, le=20)]


class UserLoginResponse(UserResponse):
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        from_attributes = True

class FoundItemRecommendation(BaseModel):
    id: int
    item_name: str    
    item_category: ItemCategoryEnum
    location: str
    date_found: datetime
    match_score: float 

    class Config:
        from_attributes = True

class LostItemAdmin(LostItemResponse):
    deleted_at: Optional[datetime]
    is_flagged: bool

class FoundItemAdmin(FoundItemResponse):
    deleted_at: Optional[datetime]
    is_flagged: bool

class ClaimItemAdmin(ClaimResponse):
    deleted_at: Optional[datetime]