from pydantic import BaseModel
from typing import Dict , Optional , List

class GeneralChatRequest(BaseModel):
    question:str


class Features(BaseModel):
    raw_output:str

class Analysis(BaseModel):
    features: Features
    predictions: Dict = {}
    severity: Optional[str]
    recommendedDoctor: Optional[str]
    summary: Optional[str]
    chatbotExplanation: Optional[str]
    suggestions: Optional[List[str]]
    analyzedAt: Optional[str]

class ChatRequest(BaseModel):
    analysis : Analysis
    question : str

class ChatResponse(BaseModel):
    answer:str