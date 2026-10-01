from fastapi import FastAPI
app = FastAPI(title="Internship Intelligence ML Service", version="1.0")

@app.get("/")
def home():
    return {"message":"Internship Intelligence ML Service","status":"running"}


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
