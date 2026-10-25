def build_chat_prompt(analysis , question):
    """
    Build the prompt that you will send to LLM
    """
    severity = analysis.severity
    doctor = analysis.recommendedDoctor
    summary = analysis.summary
    explanation = analysis.chatbotExplanation
    suggestions = analysis.suggestions

    prompt = f"""
You are a medical assistant chatbot helping users understand their lab reports.

Medical Report Analysis:

Severity Level: {severity}

Recommended Doctor: {doctor}

Summary of Findings:
{summary}

Detailed Explanation:
{explanation}

Medical Suggestions:
{suggestions}

User Question:
{question}

Instructions:
- Explain clearly in simple language.
- Use the report context to answer.
- Do not give a medical diagnosis.
- Encourage consulting a doctor if needed.
"""
    return prompt


def build_general_prompt(question: str):

    prompt = f"""
You are a knowledgeable medical assistant.

The user is asking a general health question.

Question:
{question}

Instructions:
- Explain clearly in simple language.
- Keep answers medically accurate.
- Do not diagnose diseases.
- If necessary, advise consulting a doctor.
"""

    return prompt