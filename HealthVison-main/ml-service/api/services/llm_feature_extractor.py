import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

print("OPENROUTER KEY PRESENT:", bool(OPENROUTER_API_KEY))

# OpenRouter client
client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# Multiple fallback models (order matters)
MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "stepfun/step-3.5-flash:free",
    "arcee-ai/trinity-large-preview:free",
    "openai/gpt-oss-120b:free",
]


def extract_features_with_llm(text: str):

    # limit text size to avoid huge token usage

    prompt = f"""
You are an expert medical laboratory report parser.

Your task is to extract ALL laboratory test results from the medical report.

The report may contain:
- OCR mistakes
- spelling errors
- irregular formatting
- duplicated sections
- reference ranges
- units and notes

Carefully analyze the report and extract the actual measured values.

Rules:

1. Extract EVERY laboratory test result present in the report.
2. Ignore reference ranges.
3. Extract the measured numeric value only.
4. Keep the laboratory test name as the key.
5. Normalize test names to lowercase with underscores.
   Example:
   "Glucose Fasting" → glucose_fasting
   "AST (SGOT)" → ast
   "ALT (SGPT)" → alt
6. If a value cannot be determined return null.
7. Do NOT include explanations.
8. Return ONLY valid JSON.

Expected JSON format:
    
    # Return ONLY JSON.

# Example:

# {{
#  "creatinine": 1.0,
#  "urea": 40,
#  "uric_acid": 7,
#  "ast": 30,
#  "alt": 40,
#  "hdl": 30,
#  "ldl": 50,
#  "glucose_fasting": 80,
#  "vitamin_b12": 400,
#  "vitamin_d": 150,
#  "t3": 1.0,
#  "t4": 7.0,
#  "tsh": 3.0,
#  "hba1c": 10.0
# }}
Medical Report:
{text}
"""


    # Try each model until one succeeds
    for model_name in MODELS:

        try:

            print(f"Trying model: {model_name}")

            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You extract structured medical data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )

            output = response.choices[0].message.content.strip()

            print("LLM RAW OUTPUT:", output)

            try:
                return json.loads(output)

            except Exception:
                return {"raw_output": output}

        except Exception as e:

            print(f"Model failed: {model_name}")
            print("Error:", e)

            continue

    # if all models fail
    return {"error": "all_models_failed"}