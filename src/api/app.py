from pathlib import Path
import shutil
import tempfile
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from os import remove
from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.domain.predict import DomainPredictor
from src.recommender.recommendation_engine import RecommendationEngine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Internship Intelligence Platform",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET = "data/final/training_dataset_domain.csv"

extractor = ProfileExtractor()
predictor = DomainPredictor()

engine = RecommendationEngine(
    dataset_path=DATASET,
    embedding_path="src/models/saved/internship_embeddings.npy",
    index_path="data/embeddings/internship_index.csv",
)
@app.get("/")
def home():

    return {
        "message": "Internship Intelligence Platform API",
        "status": "running"
    }


@app.post("/recommend")
async def recommend_resume(file: UploadFile = File(...)):

    suffix = Path(file.filename).suffix

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        shutil.copyfileobj(file.file, temp)
        temp_path = temp.name

    try:
        parser = ResumeParser(temp_path)
        resume_text = parser.parse()

        profile = extractor.extract_profile(resume_text)
        skill_text = " ".join(profile["skills"])

        domain = predictor.predict(skill_text)
        profile["preferred_domain"] = domain

        recommendations = engine.recommend(
            student_text=resume_text,
            student_skills=profile["skills"],
            preferred_domain=domain,
            top_k=10,
        )

        recommendations = recommendations.where(
            recommendations.notna(),
            None
        )

        return {
            "profile": profile,
            "predicted_domain": domain,
            "recommendations": recommendations.to_dict(
                orient="records"
            )
        }

    finally:
        Path(temp_path).unlink(missing_ok=True)