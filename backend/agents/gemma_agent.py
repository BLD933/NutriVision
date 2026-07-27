import os
import re
import threading

CLOUD_MODEL = "gemma-4-26b-a4b-it"
LOCAL_MODEL = "gemma4:e4b"

SYSTEM = ("Tu es NutriVision, un assistant nutrition marocain spécialisé en régime méditerranéen. "
          "Réponds en français, directement et sans planification interne. "
          "Ne rédige ni plan ni brouillon ni note interne. Donne la réponse finale immédiatement. "
          "Termine par : ⚠️ Ceci ne remplace pas un avis médical.")

_api_key = os.environ.get("GEMINI_API_KEY")
_USE_CLOUD = bool(_api_key)

if _USE_CLOUD:
    import google.genai as genai
    from google.genai import types
    _client = genai.Client(api_key=_api_key)
else:
    import ollama


def _build_prompt(question, nutrition_ctx, profil, rag_docs):
    context = ""
    if nutrition_ctx:
        context += f"Meal: {nutrition_ctx}\n"
    if rag_docs:
        context += f"Guidelines: {rag_docs[:300]}\n"
    profile_str = ""
    if profil.get("age") or profil.get("pathologie", "none") != "none":
        profile_str = (f"Age:{profil.get('age','?')} "
                       f"Path:{profil.get('pathologie','none')} "
                       f"Cal:{profil.get('calories_limit',2000)}")
    parts = [SYSTEM]
    if profile_str:
        parts.append(f"\n\nProfil patient: {profile_str}")
    if context:
        parts.append(f"\nContexte: {context}")
    parts.append(f"\n\nQuestion: {question}\n\nRéponse:")
    return "".join(parts)



def _extract_all_text(response):
    text = ""
    for candidate in response.candidates:
        for part in candidate.content.parts:
            if part.text and not getattr(part, "thought", False):
                text += part.text
    if not text and response.text:
        text = response.text
    return text.strip()


def ask_gemma(question, nutrition_ctx, profil, rag_docs="", num_predict=None):
    if num_predict is None:
        num_predict = 1024 if _USE_CLOUD else 128
    prompt = _build_prompt(question, nutrition_ctx, profil, rag_docs)
    if _USE_CLOUD:
        resp = _client.models.generate_content(
            model=CLOUD_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=num_predict,
                temperature=0.7,
            ),
        )
        return _extract_all_text(resp)
    else:
        resp = ollama.chat(
            model=LOCAL_MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"num_predict": num_predict},
        )
        return resp["message"]["content"]


def ask_gemma_stream(question, nutrition_ctx, profil, rag_docs="", num_predict=None):
    if num_predict is None:
        num_predict = 1024 if _USE_CLOUD else 128
    prompt = _build_prompt(question, nutrition_ctx, profil, rag_docs)
    if _USE_CLOUD:
        stream = _client.models.generate_content_stream(
            model=CLOUD_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=num_predict,
                temperature=0.7,
            ),
        )
        for chunk in stream:
            text = _extract_all_text(chunk) if chunk.candidates else (chunk.text or "")
            if text:
                yield text
    else:
        stream = ollama.chat(
            model=LOCAL_MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"num_predict": num_predict},
            stream=True,
        )
        for chunk in stream:
            content = chunk["message"]["content"]
            if content:
                yield content


def warm_model():
    try:
        if _USE_CLOUD:
            _client.models.generate_content(
                model=CLOUD_MODEL,
                contents="ping",
                config=types.GenerateContentConfig(max_output_tokens=1),
            )
        else:
            ollama.chat(model=LOCAL_MODEL, messages=[{"role": "user", "content": "ping"}], options={"num_predict": 1})
    except Exception:
        pass


threading.Thread(target=warm_model, daemon=True).start()
