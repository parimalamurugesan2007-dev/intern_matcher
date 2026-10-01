from fastapi import FastAPI
app = FastAPI(title="Internship Intelligence ML Service", version="1.0")

@app.get("/")
def home():
    return {"message":"Internship Intelligence ML Service","status":"running"}

@app.get("/health")
def health():
    return {"status":"ok"}
