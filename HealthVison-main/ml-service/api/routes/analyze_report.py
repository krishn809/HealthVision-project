from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime

from api.schemas.request_schema import ReportRequest
from api.services.mongo_service import collection, get_report_by_id
from api.services.file_service import download_file
from api.services.ocr_service import extract_text
from api.services.llm_feature_extractor import extract_features_with_llm
from api.services.ml_predictor_service import predict_diseases
from api.services.medical_explainer_service import generate_medical_explanation


router = APIRouter()


@router.post("/analyze-report")
def analyze_report(request: ReportRequest):

    try:
        # Fetch report
        report = get_report_by_id(request.report_id)

        if report is None:
            raise HTTPException(status_code=404, detail="Report Not Found")

        file_url = report["fileUrl"]

        # Download File (PDF or Image)
        file_path = download_file(file_url)

        # OCR Extraction
        extracted_text = extract_text(file_path)

        if not extracted_text or len(extracted_text.strip()) == 0:
            raise HTTPException(status_code=500, detail="OCR extraction failed")

        # LLM Feature Extraction
        features = extract_features_with_llm(extracted_text)

        if "error" in features:
            raise HTTPException(status_code=500, detail="Feature extraction failed")

        # ML Predictions
        predictions = predict_diseases(features)

        # AI Medical Explanation
        explanation = generate_medical_explanation(features, predictions)

        # Extract fields for schema
        severity = explanation.get("severity")
        recommended_doctor = explanation.get("recommended_doctor")
        summary = explanation.get("medical_summary")
        chatbot_explanation = explanation.get("chatbot_explanation")
        suggestions = explanation.get("suggestions", [])

        # Build to schema
        analysis_result = {
            "features": features,
            "predictions": predictions,
            "severity": severity,
            "recommendedDoctor": recommended_doctor,
            "summary": summary,
            "chatbotExplanation": chatbot_explanation,
            "suggestions": suggestions,
            "analyzedAt": datetime.utcnow()
        }

        # Update MongoDB
        collection.update_one(
            {"_id": ObjectId(request.report_id)},
            {
                "$set": {
                    "analysisResult": analysis_result,
                    "status": "completed"
                }
            }
        )

        return {
            "message": "Report analyzed successfully",
            "analysis": analysis_result
        }

    except Exception as e:
        # Log to error monitoring in a real system
        raise HTTPException(
            status_code=500,
            detail="Report analysis failed"
        )