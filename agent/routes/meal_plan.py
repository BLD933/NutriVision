import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
from agents.gemma_agent import ask_gemma, ask_gemma_stream

meal_plan_bp = Blueprint("meal_plan", __name__)

DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
MEALS = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"]

GOAL_LABELS = {
    "perte": "Perte de poids",
    "prise": "Prise de masse",
    "entretien": "Entretien",
    "diabete": "Diabète",
    "hypertension": "Hypertension",
    "sportif": "Performance sportive",
    "grossesse": "Grossesse",
    "vegan": "Végan/Végétarien",
}


def _build_prompt(goal: str, restrictions: str, allergies: str, duration: str, notes: str, profil: dict):
    goal_label = GOAL_LABELS.get(goal, goal or "Non spécifié")
    return f"""You are a professional nutritionist and chef. Generate a complete weekly meal plan.

Client goal: {goal_label}
Restrictions: {restrictions or "None"}
Allergies: {allergies or "None"}
Duration: {duration or "1 semaine"}
Notes: {notes or "None"}
Profile: Age {profil.get('age', '?')} | Pathologies: {profil.get('pathologie', 'none')} | Calorie limit: {profil.get('calories_limit', 2000)} kcal/day

Return the plan in this EXACT format for each day (Lundi through Dimanche):

## Lundi
**Petit-déjeuner:** [meal name] (~XXX kcal) — [brief note]
**Déjeuner:** [meal name] (~XXX kcal) — [brief note]
**Collation:** [meal name] (~XXX kcal) — [brief note]
**Dîner:** [meal name] (~XXX kcal) — [brief note]

## Mardi
... (same pattern through Dimanche)

### Conseils nutritionnels
Brief advice tailored to the client's goal and profile.

Use French. Keep meals realistic, diverse, and adapted to the goal and restrictions."""

@meal_plan_bp.route("/api/meal-plan/generate/stream", methods=["POST"])
def generate_stream():
    data = request.get_json() or {}
    goal = data.get("goal", "")
    restrictions = data.get("restrictions", "")
    allergies = data.get("allergies", "")
    duration = data.get("duration", "1 semaine")
    notes = data.get("notes", "")
    profil = data.get("profile") or {}

    if not goal and not restrictions:
        return jsonify({"error": "goal or restrictions required"}), 400

    prompt = _build_prompt(goal, restrictions, allergies, duration, notes, profil)

    def stream():
        for chunk in ask_gemma_stream(
            question=prompt,
            nutrition_ctx={},
            profil=profil,
            rag_docs="",
            num_predict=1024,
        ):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")
