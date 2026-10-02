from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.router import router as auth_user_router

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001").rstrip("/")
ML_TIMEOUT = float(os.getenv("ML_SERVICE_TIMEOUT", "120"))

app = FastAPI(title="Internship Intelligence Platform", version="3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:4173", "http://localhost:3000",
        "http://127.0.0.1:5173", "http://127.0.0.1:4173", "http://127.0.0.1:3000",
        "https://intern-matcher.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_user_router)

@app.on_event("startup")
def startup():
    init_db()

async def ml_upload(path: str, file: UploadFile, params: dict[str, Any] | None = None):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")
    data = await file.read()
    files = {"file": (file.filename, data, file.content_type or "application/octet-stream")}
    try:
        async with httpx.AsyncClient(timeout=ML_TIMEOUT) as client:
            response = await client.post(f"{ML_SERVICE_URL}{path}", files=files, params=params or {})
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="ML service is unavailable.")
    if response.status_code >= 400:
        try:
            detail = response.json().get("detail", "ML service request failed.")
        except Exception:
            detail = "ML service request failed."
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()

@app.get("/")
def home():
    return {"message": "Internship Intelligence Platform API", "status": "running"}

@app.get("/health")
async def health():
    ml_status = "unavailable"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{ML_SERVICE_URL}/health")
            ml_status = response.json()
    except Exception:
        ml_status = "unavailable"
    return {"status": "healthy" if ml_status != "unavailable" else "degraded",
            "ml_service": ml_status}

@app.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    top_domains: int = Query(default=5, ge=1, le=10),
):
    return await ml_upload("/ml/analyze-resume", file, {"top_domains": top_domains})

@app.post("/recommend")
async def recommend_resume(
    file: UploadFile = File(...),
    top_k: int = Query(default=10, ge=1, le=50),
    top_domains: int = Query(default=5, ge=1, le=10),
):
    return await ml_upload("/ml/recommend", file, {"top_k": top_k, "top_domains": top_domains})

@app.get("/recommend/domain/{domain}")
async def recommend_by_domain(domain: str, top_k: int = Query(default=10, ge=1, le=100)):
    try:
        async with httpx.AsyncClient(timeout=ML_TIMEOUT) as client:
            response = await client.get(f"{ML_SERVICE_URL}/ml/recommend/domain/{domain}", params={"top_k": top_k})
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="ML service is unavailable.")
    if response.status_code >= 400:
        try:
            detail = response.json().get("detail", "ML service request failed.")
        except Exception:
            detail = "ML service request failed."
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()

@app.get("/internships/search")
async def search_internships(
    location: str | None = None, domain: str | None = None, mode: str | None = None,
    duration: str | None = None, stipend: str | None = None,
    min_stipend: float | None = Query(default=None, ge=0),
    company: str | None = None, skills: str | None = None,
    keyword: str | None = None, limit: int | None = Query(default=None, ge=1, le=200),
    top_k: int = Query(default=50, ge=1, le=200),
):
    params = {
        "location": location, "domain": domain, "mode": mode, "duration": duration,
        "stipend": stipend, "min_stipend": min_stipend, "company": company,
        "skills": skills, "keyword": keyword, "limit": limit, "top_k": top_k,
    }
    params = {k: v for k, v in params.items() if v is not None}
    try:
        async with httpx.AsyncClient(timeout=ML_TIMEOUT) as client:
            response = await client.get(f"{ML_SERVICE_URL}/ml/internships/search", params=params)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="ML service is unavailable.")
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail="ML service request failed.")
    return response.json()
