
import os
from google import genai

_key     = os.environ.get("GEMINI_API_KEY")
_client  = genai.Client(api_key=_key)
_MODEL   = "gemma-4-31b-it"

SYSTEM = """You are NutriVision, an AI nutrition healthcare assistant.
You help patients with diabetes, hypertension, obesity, and kidney disease.
Always cite your medical sources (WHO, ADA, HAS Maroc).
Be empathetic and clear. Respond in the same language as the user.
Always end with: ⚠️ This is not a substitute for medical advice."""

def ask_gemma(question: str, nutrition_ctx: dict, profil: dict, rag_docs: str = "") -> str:
    prompt = f"""{SYSTEM}

Patient profile:
- Age: {profil.get("age", "?")}
- Pathology: {profil.get("pathologie", "none")}
- Daily calorie limit: {profil.get("calories_limit", 2000)} kcal
- Sodium limit: {profil.get("sodium_limit_mg", 2000)} mg/day

Meal detected:
{nutrition_ctx}

Medical guidelines (RAG):
{rag_docs if rag_docs else "No specific guidelines retrieved."}

Patient question: {question}

Give a personalized recommendation. Cite your sources."""

    response = _client.models.generate_content(
        model=_MODEL,
        contents=prompt,
    )
    return response.text
