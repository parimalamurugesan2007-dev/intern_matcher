"""
Pydantic request/response models for the auth, user, saved, and applied endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ---- Auth ----
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# ---- User ----
class ProfileResponse(BaseModel):
    name: str
    email: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# ---- Saved ----
class SavedInternshipRequest(BaseModel):
    internship_id: str
    role: str
    company: str
    location: Optional[str] = ""
    stipend: Optional[str] = ""
    domain: Optional[str] = ""
    website_link: Optional[str] = ""


class SavedInternshipResponse(BaseModel):
    id: int
    internship_id: str
    role: str
    company: str
    location: str
    stipend: str
    domain: str
    website_link: str
    saved_at: datetime

    model_config = {"from_attributes": True}


# ---- Applied ----
class AppliedInternshipRequest(BaseModel):
    internship_id: str
    role: str
    company: str


class AppliedInternshipResponse(BaseModel):
    id: int
    internship_id: str
    role: str
    company: str
    applied_at: datetime
    status: str

    model_config = {"from_attributes": True}
