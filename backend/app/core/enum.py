#app/core/enum.py
import enum
from enum import Enum

class ItemCategoryEnum(str, enum.Enum):
    electronics = "electronics"          # phones, laptops, earbuds, calculators
    documents = "documents"              # ID cards, transcripts, certificates
    stationery = "stationery"            # notebooks, pens, books, registers
    accessories = "accessories"          # watches, glasses, jewelry
    bags = "bags"                        # backpacks, handbags, laptop bags
    clothing = "clothing"                # jackets, hoodies, scarves
    keys = "keys"                        # keys, keychains
    cards = "cards"                      # ATM, library, transport cards
    personal_items = "personal_items"    # wallets, purses, cosmetics
    others = "others"

class ItemStatus(str, Enum):
    active = "active"       
    pending = "pending"    
    resolved = "resolved"   

class ClaimStatus(str, enum.Enum):
    """
    Enum representing the lifecycle of a claim.
    """
    pending_approval = "pending_approval"       # Initial state when claimant submits a request
    awaiting_verification = "awaiting_verification" # Finder approved, code sent to claimant
    verified = "verified"                       # Code matched, item returned
    rejected = "rejected"                       # Finder denied the claim