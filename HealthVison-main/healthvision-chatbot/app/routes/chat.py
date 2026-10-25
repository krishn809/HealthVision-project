from fastapi import APIRouter
from app.models.chat_model import ChatRequest , ChatResponse , GeneralChatRequest
from app.utils.prompt_builder import build_chat_prompt, build_general_prompt
from app.services.llm_service import generate_chat_response


router = APIRouter()

@router.post("/chat" , response_model=ChatResponse)
def chat_with_bot(request:ChatRequest):

    prompt = build_chat_prompt(request.analysis , request.question)

    answer = generate_chat_response(prompt)

    return ChatResponse(answer=answer)

@router.post("/general-chat" , response_model=ChatResponse)
def general_chat(request : GeneralChatRequest):

    prompt =  build_general_prompt(request.question)
    answer  =  generate_chat_response(prompt)

    return ChatResponse(answer=answer)