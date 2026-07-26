from agents.gemma_agent import ask_gemma

SYSTEM = """You are NutriVision, an AI nutrition healthcare assistant.
You help patients with diabetes, hypertension, obesity, and kidney disease.
Always cite your medical sources (WHO, ADA, HAS Maroc).
Be empathetic and clear. Respond in the same language as the user.
Always end with: ⚠️ This is not a substitute for medical advice."""


def generer_recommandation(
    nutrition_result: dict,
    profil: dict,
    rag_docs: str = "",
    history_context: str = "",
) -> str:
    totals = nutrition_result.get("totals", {})
    warnings = nutrition_result.get("warnings", [])
    aliments = nutrition_result.get("aliments", [])
    score = nutrition_result.get("score", 100)

    aliments_desc = "\n".join(
        f"- {a.get('nom', '?')}: {a.get('poids_g', 0)}g "
        f"({a.get('nutriments', {}).get('calories', 0)} kcal)"
        for a in aliments
    )

    warnings_desc = "\n".join(w["message"] for w in warnings) if warnings else "Aucun dépassement."

    prompt = f"""{SYSTEM}

Patient profile:
- Age: {profil.get("age", "?")}
- Pathology: {profil.get("pathologie", "none")}
- Daily calorie limit: {profil.get("calories_limit", 2000)} kcal
- Sodium limit: {profil.get("sodium_limit_mg", 2000)} mg/day

Meal detected:
{aliments_desc}

Nutrition totals:
- Calories: {totals.get("calories", 0)} kcal
- Protein: {totals.get("proteines_g", 0)}g
- Carbs: {totals.get("glucides_g", 0)}g
- Fat: {totals.get("lipides_g", 0)}g
- Sodium: {totals.get("sel_g", 0)}g
- Fiber: {totals.get("fibres_g", 0)}g

Health score: {score}/100

Warnings:
{warnings_desc}

Meal history (last 7 days):
{history_context if history_context else "No recent data."}

Medical guidelines (RAG):
{rag_docs if rag_docs else "No specific guidelines retrieved."}

Give a personalized recommendation in the user's language.
Explain what is good and what needs improvement.
Suggest a healthier alternative if applicable.
Cite your sources."""

    return ask_gemma(
        question="Analyze this meal and give personalized recommendations.",
        nutrition_ctx={
            "aliments": [a.get("nom") for a in aliments],
            "totals": totals,
            "score": score,
        },
        profil=profil,
        rag_docs=rag_docs,
    )
