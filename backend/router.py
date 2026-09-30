"""
FastAPI router with auth, user, saved, and applied endpoints.

This is mounted into the existing app via `app.include_router(router)`,
keeping all original endpoints untouched.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from .database import (
    AppliedInternship,
    SavedInternship,
    User,
    get_db,
)
from .models import (
    AppliedInternshipRequest,
    AppliedInternshipResponse,
    AuthResponse,
    LoginRequest,
    PasswordChangeRequest,
    ProfileResponse,
    RegisterRequest,
    SavedInternshipRequest,
    SavedInternshipResponse,
    UserResponse,
)

router = APIRouter()


# ---- Auth ----
@router.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(token=token, user=UserResponse.model_validate(user))


@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(token=token, user=UserResponse.model_validate(user))


# ---- User ----
@router.get("/user/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user)):
    return ProfileResponse(name=user.name, email=user.email)


@router.put("/user/password")
def change_password(
    req: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ---- Saved ----
@router.post("/saved", response_model=SavedInternshipResponse)
def save_internship(
    req: SavedInternshipRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = SavedInternship(
        user_id=user.id,
        internship_id=req.internship_id,
        role=req.role,
        company=req.company,
        location=req.location or "",
        stipend=req.stipend or "",
        domain=req.domain or "",
        website_link=req.website_link or "",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return SavedInternshipResponse.model_validate(record)


@router.get("/saved", response_model=list[SavedInternshipResponse])
def get_saved_internships(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(SavedInternship)
        .filter(SavedInternship.user_id == user.id)
        .order_by(SavedInternship.saved_at.desc())
        .all()
    )
    return [SavedInternshipResponse.model_validate(r) for r in records]


@router.delete("/saved/{saved_id}")
def delete_saved_internship(
    saved_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(SavedInternship)
        .filter(SavedInternship.id == saved_id, SavedInternship.user_id == user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Saved internship not found.")
    db.delete(record)
    db.commit()
    return {"message": "Saved internship removed"}


# ---- Applied ----
@router.post("/applied", response_model=AppliedInternshipResponse)
def apply_internship(
    req: AppliedInternshipRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = AppliedInternship(
        user_id=user.id,
        internship_id=req.internship_id,
        role=req.role,
        company=req.company,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return AppliedInternshipResponse.model_validate(record)


@router.get("/applied", response_model=list[AppliedInternshipResponse])
def get_applied_internships(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(AppliedInternship)
        .filter(AppliedInternship.user_id == user.id)
        .order_by(AppliedInternship.applied_at.desc())
        .all()
    )
    return [AppliedInternshipResponse.model_validate(r) for r in records]
