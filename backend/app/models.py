#app/models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from app.core.enum import ItemCategoryEnum, ClaimStatus, ItemStatus


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    google_id = Column(String(255), nullable=True, unique=True)
    picture_url = Column(String(500), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)   # True = Allowed, False = Blocked
    is_flagged = Column(Boolean, default=False) # True = Suspicious User

    lost_items = relationship("LostItem", back_populates="user")
    found_items = relationship("FoundItem", back_populates="user")
    trust_score = relationship("TrustScore", back_populates="user",uselist=False, cascade="all, delete")

class LostItem(Base):
    __tablename__ = "lost_items"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), index=True)
    item_category = Column(Enum(ItemCategoryEnum), nullable=False, index=True)
    location = Column(String(255),nullable=True, index=True)
    description = Column(Text, nullable=True)   # private
    embedding = Column(Text, nullable=True)
  
    contact = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    date_lost = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    deleted_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="lost_items")
    claims = relationship("Claim", back_populates="lost_item")
    is_active = Column(Boolean, default=True, index=True)
    is_flagged = Column(Boolean, default=False)
    status = Column(Enum(ItemStatus), default=ItemStatus.active, index=True)


class FoundItem(Base):
    __tablename__ = "found_items"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), index=True)
    item_category = Column(Enum(ItemCategoryEnum), nullable=False, index=True)
    location = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)  # private
    embedding = Column(Text, nullable=True)
    contact = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    date_found = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    deleted_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="found_items")
    claims = relationship("Claim", back_populates="found_item")
    is_active = Column(Boolean, default=True, index=True)
    is_flagged = Column(Boolean, default=False)
    status = Column(Enum(ItemStatus), default=ItemStatus.active, index=True)


class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id", ondelete="SET NULL"))
    found_item_id = Column(Integer, ForeignKey("found_items.id", ondelete="SET NULL"))
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    finder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.pending_approval)
    ownership_answers = Column(Text, nullable=False)
    fraud_score = Column(Integer, default=0)        # 0–100
    is_suspicious = Column(Boolean, default=False)  # auto-marked
    secure_code_hash = Column(String(255), nullable=True) # Stores hashed verification code 
    justification = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    verification_sent_at = Column(DateTime, nullable=True)

    claimant = relationship("User", foreign_keys=[claimant_id])
    finder = relationship("User", foreign_keys=[finder_id])
    lost_item = relationship("LostItem", back_populates="claims")
    found_item = relationship("FoundItem", back_populates="claims")

class MatchLog(Base):
    __tablename__ = "match_logs"
    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer,ForeignKey("lost_items.id", ondelete="CASCADE"),nullable=False)
    found_item_id = Column(Integer,ForeignKey("found_items.id", ondelete="CASCADE"),nullable=False)
    similarity_score = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False, default=0.75)
    match_status = Column(
        String(50),
        default="candidate"
    )
    created_at = Column(DateTime, default=datetime.utcnow)



class TrustScore(Base):
    __tablename__ = "trust_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    score = Column(Integer, default=0)

    user = relationship("User", back_populates="trust_score")


Index("idx_lost_item_user", LostItem.user_id)
Index("idx_found_item_user", FoundItem.user_id)
Index("idx_claim_status", Claim.status)
Index("idx_match_pair", MatchLog.lost_item_id, MatchLog.found_item_id)
Index("idx_lost_match_lookup",LostItem.item_category,LostItem.location, LostItem.is_active)
Index("idx_found_match_lookup",FoundItem.item_category,FoundItem.location, FoundItem.is_active)
