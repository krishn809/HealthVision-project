from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.analyze_report import router as analyze_router
import os

app = FastAPI(title="ML Service of HealthVision",
              description="OCR + ML + LLM pipeline for disease prediction",
              version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)

@app.get("/")
def root():
    return {"status":"ML service is running"}