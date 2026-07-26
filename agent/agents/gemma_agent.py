import ollama
import threading

_MODEL = "gemma4:4b"
SYSTEM = "Tu es NutriVision, un assistant nutrition. Réponds en français. Sois concis mais précis. Termine par : ⚠️ Ceci ne remplace pas un avis médical."

def _build_prompt(question, nutrition_ctx, profil, rag_docs):
    context = ""
    if nutrition_ctx:
        context += f"Meal: {nutrition_ctx}\n"
    if rag_docs:
        context += f"Guidelines: {rag_docs[:300]}\n"
    profile_str = ""
    if profil.get("age") or profil.get("pathologie", "none") != "none":
        profile_str = f"Age:{profil.get('age','?')} Path:{profil.get('pathologie','none')} Cal:{profil.get('calories_limit',2000)}"
    if profile_str or context:
        return f"{SYSTEM}\n\n{profile_str}\n{context}\nQ: {question}\nA:"
    return f"{SYSTEM}\n\nQ: {question}\nA:"


def ask_gemma(question: str, nutrition_ctx: dict, profil: dict, rag_docs: str = "", num_predict: int = 64) -> str:
    prompt = _build_prompt(question, nutrition_ctx, profil, rag_docs)
    response = ollama.chat(
        model=_MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": num_predict},
    )
    return response["message"]["content"]


def ask_gemma_stream(question: str, nutrition_ctx: dict, profil: dict, rag_docs: str = "", num_predict: int = 64):
    prompt = _build_prompt(question, nutrition_ctx, profil, rag_docs)
    stream = ollama.chat(
        model=_MODEL,
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
        ollama.chat(model=_MODEL, messages=[{"role": "user", "content": "ping"}], options={"num_predict": 1})
    except Exception:
        pass


threading.Thread(target=warm_model, daemon=True).start()
