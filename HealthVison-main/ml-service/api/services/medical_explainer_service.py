import os
import json
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

MODELS = [
    "openai/gpt-oss-120b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "stepfun/step-3.5-flash:free",
]



def generate_medical_explanation(features, predictions):

    prompt = f"""
You are a professional AI medical assistant.

You are given:

Extracted lab values:
{features}

Machine learning disease predictions:
{predictions}

Your job:

1. Determine overall health severity:

- Normal
- Not Much Severe
- Severe
- High Severe

2. Identify abnormal lab values.

3. Determine the most likely health issue.

4. Recommend the appropriate doctor type if required.

Examples:
Endocrinologist → diabetes
Cardiologist → heart
Nephrologist → kidney
Hepatologist → liver
General Physician → mild issues

5. Provide lifestyle suggestions.

6. Write a patient-friendly explanation describing:
   - what the problem might be
   - why it might happen
   - what the patient should do next

Rules:

• If severity = Normal → only suggestions  
• If severity = Not Much Severe → lifestyle advice  
• If severity = Severe → recommend doctor  
• If severity = High Severe → strongly recommend doctor consultation  

Return STRICT JSON format:

{{
 "severity": "",
 "main_issue": "",
 "recommended_doctor": "",
 "abnormal_values": {{}},
 "suggestions": [],
 "medical_summary": "",
 "chatbot_explanation": ""
}}
"""

    for model in MODELS:
        try:
            print("Trying explanation model:", model)

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )

            result = response.choices[0].message.content

            return json.loads(result)

        except Exception as e:
            print("Model failed:", model)
            print("Error:", e)

    return {"error": "All explanation models failed"}