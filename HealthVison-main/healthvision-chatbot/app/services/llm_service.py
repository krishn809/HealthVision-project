import json
from openai import OpenAI
from app.core.config import OPENROUTER_API_KEY


client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)


MODELS = [
    "stepfun/step-3.5-flash:free",
    "arcee-ai/trinity-large-preview:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-120b:free"
]

def generate_chat_response(prompt:str) -> str:
    """
    Send prompt to the OPENROUTER models and return response.
    """

    for model in MODELS:
        try:
            print("Trying model" , model)

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful medical assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )

            return response.choices[0].message.content
        
        except Exception as e:
            print("Model Failed :" , model)
            print("error : " , e)

    return "ALL AI models failed to get response"


























