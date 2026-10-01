from __future__ import annotations
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
import tempfile

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from src.config.settings import settings
from src.domain.predict import DomainPredictor
from src.recommender.recommendation_engine import RecommendationEngine
from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.utils.logger import logger

SUPPORTED_RESUME_EXTENSIONS = {".pdf", ".docx"}
ml_state: dict[str, Any] = {"extractor": None, "predictor": None, "engine": None}

@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_state["extractor"] = ProfileExtractor()
    try:
        ml_state["predictor"] = DomainPredictor()
        ml_state["engine"] = RecommendationEngine(
            dataset_path=settings.DATASET_PATH,
            embedding_path=settings.EMBEDDING_PATH,
            index_path=settings.EMBEDDING_INDEX_PATH,
        )
    except Exception:
        logger.exception("ML artifacts failed to load")
    yield

app = FastAPI(title="Internship Intelligence ML Service", version="1.0", lifespan=lifespan)

def require(name: str):
    value = ml_state.get(name)
    if value is None:
        raise HTTPException(status_code=503, detail=f"ML component '{name}' is unavailable.")
    return value

def records(df) -> list[dict[str, Any]]:
    return df.where(df.notna(), None).to_dict(orient="records")

async def extract_profile(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Only PDF and DOCX resumes are supported.")
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(await file.read())
            temp_path = Path(temp.name)
        try:
            text = ResumeParser(str(temp_path)).parse()
        except Exception:
            logger.exception("Resume parsing failed")
            raise HTTPException(status_code=422, detail="Could not read the uploaded resume.")
        if not text.strip():
            raise HTTPException(status_code=422, detail="The uploaded resume is empty or unreadable.")
        profile = require("extractor").extract_profile(text)
        if not profile.get("skills"):
            raise HTTPException(status_code=422, detail="No recognizable skills were found in the resume.")
        return text, profile
    finally:
        if temp_path:
            temp_path.unlink(missing_ok=True)

@app.get("/")
def home():
    return {"message": "Internship Intelligence ML Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy" if all(ml_state.values()) else "degraded",
            "services": {k: v is not None for k, v in ml_state.items()}}

@app.post("/ml/analyze-resume")
async def analyze_resume(file: UploadFile = File(...), top_domains: int = Query(default=settings.TOP_K_DOMAINS, ge=1, le=10)):
    text, profile = await extract_profile(file)
    domains = require("predictor").predict_top_domains_from_skills(profile["skills"], top_k=top_domains)
    return {"filename": file.filename, "resume_text": text, "profile": profile,
            "extracted_skills": profile["skills"], "predicted_domains": domains}

@app.post("/ml/recommend")
async def recommend(file: UploadFile = File(...), top_k: int = Query(default=settings.DEFAULT_RECOMMEND_TOP_K, ge=1, le=50),
                    top_domains: int = Query(default=settings.TOP_K_DOMAINS, ge=1, le=10)):
    text, profile = await extract_profile(file)
    domains = require("predictor").predict_top_domains(" ".join(profile["skills"]), top_k=top_domains)
    predicted = next((x["domain"] for x in domains if x["domain"] != "Others"),
                     domains[0]["domain"] if domains else "Others")
    profile["preferred_domain"] = predicted
    try:
        df = require("engine").recommend(student_text=text, student_skills=profile["skills"],
                                         preferred_domain=predicted, top_k=top_k)
    except Exception:
        logger.exception("Recommendation generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate internship recommendations.")
    return {"profile": profile, "predicted_domain": predicted,
            "predicted_domains": domains, "recommendations": records(df)}
