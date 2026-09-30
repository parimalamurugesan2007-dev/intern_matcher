"""
FastAPI Application — Internship Intelligence Platform

Author : Internship Intelligence Platform

Endpoints
---------
GET  /                          Basic liveness message
GET  /health                    Health check + ML artifact availability
POST /resume/upload             Resume upload -> extracted skills + top-5 domains (no recommendations)
POST /recommend                 Resume upload -> profile + top-5 domains + recommendations
GET  /recommend/domain/{domain} Internships belonging to one domain (domain name is normalized)
GET  /internships/search        Manual multi-filter internship search

Design notes
------------
- All heavyweight objects (ML model, vectorizer, label encoder,
  sentence-transformer, embeddings, dataset) are loaded exactly ONCE
  at application startup via the lifespan handler, then reused for
  every request — never reloaded per-request.
- No internal exception detail (stack traces) is ever returned to
  the client; everything is logged server-side and mapped to a
  clean HTTP error response.
"""

from __future__ import annotations

import shutil
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.router import router as auth_user_router
from src.config.settings import settings
from src.domain.normalizer import normalize_domain
from src.domain.predict import DomainPredictor
from src.recommender.recommendation_engine import RecommendationEngine
from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.utils.logger import logger

SUPPORTED_RESUME_EXTENSIONS = {".pdf", ".docx"}

# ML services are populated once in the lifespan handler below and
# referenced from request handlers via `app.state`.
ml_state: dict[str, Any] = {
    "extractor": None,
    "predictor": None,
    "engine": None,
    "predictor_error": None,
    "engine_error": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load every ML artifact once at startup; nothing is reloaded per-request."""

    logger.info("=" * 70)
    logger.info("Application Startup: Loading ML Artifacts")
    logger.info("=" * 70)

    try:
        ml_state["extractor"] = ProfileExtractor()
        logger.info("Profile extractor ready")
    except Exception as error:
        logger.error(f"Failed to load profile extractor: {error}")
        ml_state["extractor"] = None

    try:
        ml_state["predictor"] = DomainPredictor()
        logger.info("Domain predictor ready")
    except Exception as error:
        logger.error(f"Failed to load domain predictor: {error}")
        ml_state["predictor"] = None
        ml_state["predictor_error"] = str(error)

    try:
        ml_state["engine"] = RecommendationEngine(
            dataset_path=settings.DATASET_PATH,
            embedding_path=settings.EMBEDDING_PATH,
            index_path=settings.EMBEDDING_INDEX_PATH,
        )
        logger.info("Recommendation engine ready")
    except Exception as error:
        logger.error(f"Failed to load recommendation engine: {error}")
        ml_state["engine"] = None
        ml_state["engine_error"] = str(error)

    logger.info("Startup complete")
    init_db()
    logger.info("Database initialized")
    yield

    logger.info("Application shutdown")


app = FastAPI(
    title="Internship Intelligence Platform",
    version="2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_user_router)
# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------

def _require_engine() -> RecommendationEngine:
    engine = ml_state.get("engine")
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine is unavailable. The internship dataset or embeddings failed to load.",
        )
    return engine


def _require_predictor() -> DomainPredictor:
    predictor = ml_state.get("predictor")
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Domain predictor is unavailable. Trained model artifacts were not found.",
        )
    return predictor


def _require_extractor() -> ProfileExtractor:
    extractor = ml_state.get("extractor")
    if extractor is None:
        raise HTTPException(
            status_code=503,
            detail="Resume profile extractor is unavailable.",
        )
    return extractor


def _dataframe_to_records(df) -> list[dict[str, Any]]:
    """Convert a pandas DataFrame to JSON-safe records (NaN -> None)."""

    df = df.where(df.notna(), None)
    return df.to_dict(orient="records")


def _validate_resume_upload(file: UploadFile) -> str:
    """Validate the uploaded file and return its lowercase suffix, or raise HTTPException."""

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_RESUME_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{suffix}'. Supported types: {sorted(SUPPORTED_RESUME_EXTENSIONS)}",
        )
    return suffix


async def _parse_resume_and_extract_profile(file: UploadFile, suffix: str) -> tuple[str, dict[str, Any]]:
    """
    Shared pipeline used by both /resume/upload and /recommend:

        Resume (PDF/DOCX) -> ResumeParser -> full text
                           -> ProfileExtractor -> profile (incl. final skill list)

    Returns (resume_text, profile). Raises HTTPException on any failure.
    The uploaded file's temp copy is always cleaned up before returning.
    """

    extractor = _require_extractor()

    temp_path: Optional[str] = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            shutil.copyfileobj(file.file, temp)
            temp_path = temp.name

        try:
            parser = ResumeParser(temp_path)
            resume_text = parser.parse()
        except Exception as error:
            logger.error(f"Resume parsing failed for '{file.filename}': {error}")
            raise HTTPException(
                status_code=422,
                detail="Could not read the uploaded resume. Please upload a valid, non-corrupted PDF or DOCX file.",
            )

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail="The uploaded resume appears to be empty or unreadable.",
            )

        profile = extractor.extract_profile(resume_text)

        if not profile.get("skills"):
            raise HTTPException(
                status_code=422,
                detail="No recognizable skills were found in the resume. Add a Skills section or more detail to your Projects/Experience.",
            )

        return resume_text, profile

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


# ---------------------------------------------------------------
# Routes
# ---------------------------------------------------------------

@app.get("/")
def home() -> dict[str, str]:
    return {
        "message": "Internship Intelligence Platform API",
        "status": "running",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    """Report whether every required ML artifact loaded successfully."""

    model_dir = Path(settings.MODEL_DIR)
    dataset_path = Path(settings.DATASET_PATH)
    embedding_path = Path(settings.EMBEDDING_PATH)

    artifacts = {
        "best_model": (model_dir / "best_model.pkl").exists(),
        "vectorizer": (model_dir / "vectorizer.pkl").exists(),
        "label_encoder": (model_dir / "label_encoder.pkl").exists(),
        "dataset": dataset_path.exists(),
        "embeddings": embedding_path.exists(),
    }

    services = {
        "profile_extractor": ml_state.get("extractor") is not None,
        "domain_predictor": ml_state.get("predictor") is not None,
        "recommendation_engine": ml_state.get("engine") is not None,
    }

    healthy = all(artifacts.values()) and all(services.values())

    return {
        "status": "healthy" if healthy else "degraded",
        "artifacts": artifacts,
        "services": services,
        "errors": {
            "domain_predictor": ml_state.get("predictor_error"),
            "recommendation_engine": ml_state.get("engine_error"),
        },
    }


@app.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    top_domains: int = Query(default=settings.TOP_K_DOMAINS, ge=1, le=10),
) -> dict[str, Any]:
    """
    Resume -> Resume Parser -> full text -> Skill Extraction -> Final Combined
    Skills -> Domain Prediction -> Top-5 Domains.

    This endpoint does NOT generate internship recommendations (that remains
    the job of POST /recommend, preserved as-is for backward compatibility).
    It exists so the frontend can show extracted skills + Top-5 domains
    immediately after upload, before the user picks a domain to browse.
    """

    suffix = _validate_resume_upload(file)
    predictor = _require_predictor()

    resume_text, profile = await _parse_resume_and_extract_profile(file, suffix)

    top_domain_results = predictor.predict_top_domains_from_skills(profile["skills"], top_k=top_domains)

    return {
        "filename": file.filename,
        "extracted_skills": profile["skills"],
        "predicted_domains": top_domain_results,
    }


@app.post("/recommend")
async def recommend_resume(
    file: UploadFile = File(...),
    top_k: int = Query(default=settings.DEFAULT_RECOMMEND_TOP_K, ge=1, le=50),
    top_domains: int = Query(default=settings.TOP_K_DOMAINS, ge=1, le=10),
) -> dict[str, Any]:
    """Upload a resume (PDF/DOCX) and receive predicted domains + ranked recommendations."""

    suffix = _validate_resume_upload(file)
    predictor = _require_predictor()
    engine = _require_engine()

    resume_text, profile = await _parse_resume_and_extract_profile(file, suffix)

    try:
        skill_text = " ".join(profile["skills"])

        top_domain_results = predictor.predict_top_domains(skill_text, top_k=top_domains)

# Skip "Others" — it is a catch-all label that gives generic results.
# Use the first specific domain the model is confident about instead.
# Example: if model returns Others=37%, Backend=15%, AI=8%
# → use Backend Development for recommendations (far more useful).
        SKIP_DOMAINS = {"Others"}
        predicted_domain = next(
            (d["domain"] for d in top_domain_results if d["domain"] not in SKIP_DOMAINS),
            top_domain_results[0]["domain"] if top_domain_results else "Others",
        )
        profile["preferred_domain"] = predicted_domain
        logger.info(f"Using domain for recommendations: '{predicted_domain}' (skipped 'Others' if present)")

        try:
            recommendations_df = engine.recommend(
                student_text=resume_text,
                student_skills=profile["skills"],
                preferred_domain=predicted_domain,
                top_k=top_k,
            )
            recommendations = _dataframe_to_records(recommendations_df)
        except Exception as error:
            logger.error(f"Recommendation generation failed: {error}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate internship recommendations.",
            )

        return {
            "profile": profile,
            # Backward-compatible single-domain field (existing frontend contract).
            "predicted_domain": predicted_domain,
            # New: full Top-K ranked list with confidence scores.
            "predicted_domains": top_domain_results,
            "recommendations": recommendations,
        }

    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Unexpected error while processing resume '{file.filename}': {error}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing the resume.")


@app.get("/recommend/domain/{domain}")
def recommend_by_domain(
    domain: str,
    top_k: int = Query(default=settings.DEFAULT_DOMAIN_RESULTS, ge=1, le=100),
) -> dict[str, Any]:
    """
    Return internships belonging to a specific domain.

    The `domain` path parameter is normalized through the single canonical
    normalizer (src.domain.normalizer.normalize_domain), so "ai", "AI/ML",
    "Artificial Intelligence" and "artificial-intelligence" all resolve to
    the same dataset rows.
    """

    if not domain or not domain.strip():
        raise HTTPException(status_code=400, detail="Domain must not be empty.")

    canonical_domain = normalize_domain(domain)
    engine = _require_engine()

    try:
        results_df = engine.recommend_by_domain(domain=domain, top_k=top_k)
    except Exception as error:
        logger.error(f"Domain recommendation failed for '{domain}': {error}")
        raise HTTPException(status_code=500, detail="Failed to fetch internships for this domain.")

    if results_df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No internships found for domain '{domain}' (normalized to '{canonical_domain}').",
        )

    return {
        "domain": canonical_domain,
        "count": len(results_df),
        "internships": _dataframe_to_records(results_df),
    }


@app.get("/internships/search")
def search_internships(
    location: Optional[str] = Query(default=None),
    domain: Optional[str] = Query(default=None),
    mode: Optional[str] = Query(default=None),
    duration: Optional[str] = Query(default=None),
    stipend: Optional[str] = Query(default=None, description="Legacy free-text stipend filter"),
    min_stipend: Optional[float] = Query(default=None, ge=0, description="Minimum stipend (numeric)"),
    company: Optional[str] = Query(default=None),
    skills: Optional[str] = Query(default=None, description="Comma-separated skill list"),
    keyword: Optional[str] = Query(default=None),
    limit: Optional[int] = Query(default=None, ge=1, le=200, description="Alias for top_k"),
    top_k: int = Query(default=settings.DEFAULT_SEARCH_LIMIT, ge=1, le=200),
) -> dict[str, Any]:
    """Manual internship search with combinable filters (AND logic)."""

    engine = _require_engine()
    effective_top_k = limit if limit is not None else top_k

    try:
        results_df = engine.search_internships(
            location=location,
            domain=domain,
            mode=mode,
            duration=duration,
            stipend=stipend,
            min_stipend=min_stipend,
            company=company,
            skills=skills,
            keyword=keyword,
            top_k=effective_top_k,
        )
    except Exception as error:
        logger.error(f"Internship search failed: {error}")
        raise HTTPException(status_code=500, detail="Failed to search internships.")

    return {
        "filters": {
            "location": location,
            "domain": normalize_domain(domain) if domain else None,
            "mode": mode,
            "duration": duration,
            "stipend": stipend,
            "min_stipend": min_stipend,
            "company": company,
            "skills": skills,
            "keyword": keyword,
        },
        "count": len(results_df),
        "internships": _dataframe_to_records(results_df),
    }
