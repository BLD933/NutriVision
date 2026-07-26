import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
from agents.gemma_agent import ask_gemma, ask_gemma_stream

recipes_bp = Blueprint("recipes", __name__)


def _build_prompt(ingredients: str, notes: str, profil: dict):
    return f"""You are a professional chef and nutritionist. Generate a healthy recipe.

User's available ingredients: {ingredients or "Any"}
User's notes: {notes or "None"}
User profile: Age {profil.get('age', '?')} | Pathology: {profil.get('pathologie', 'none')} | Cal limit: {profil.get('calories_limit', 2000)}

Return a recipe in this EXACT structured format:

## [Recipe Name]
**Temps de préparation:** X min
**Temps de cuisson:** X min
**Calories:** X kcal par portion
**Protéines:** Xg | **Glucides:** Xg | **Lipides:** Xg

### Ingrédients (for X portions)
- ingredient 1: quantity
- ingredient 2: quantity

### Instructions
1. Step one...
2. Step two...

### Pourquoi cette recette est adaptée pour vous
Explain how this recipe respects the user's health needs. If they have diabetes, note low sugar. If hypertension, note low sodium, etc.

Use French. The recipe MUST be adapted to the user's pathologies and calorie limits."""


@recipes_bp.route("/api/recipes/generate", methods=["POST"])
def generate():
    data = request.get_json() or {}
    ingredients = data.get("ingredients", "")
    notes = data.get("notes", "")
    profil = data.get("profile", {})

    if not ingredients and not notes:
        return jsonify({"error": "ingredients or notes required"}), 400

    prompt = _build_prompt(ingredients, notes, profil)
    response = ask_gemma(
        question=prompt,
        nutrition_ctx={},
        profil=profil,
        rag_docs="",
    )
    return jsonify({"recipe": response})


@recipes_bp.route("/api/recipes/generate/stream", methods=["POST"])
def generate_stream():
    data = request.get_json() or {}
    ingredients = data.get("ingredients", "")
    notes = data.get("notes", "")
    profil = data.get("profile", {})

    if not ingredients and not notes:
        return jsonify({"error": "ingredients or notes required"}), 400

    prompt = _build_prompt(ingredients, notes, profil)

    def stream():
        for chunk in ask_gemma_stream(
            question=prompt,
            nutrition_ctx={},
            profil=profil,
            rag_docs="",
        ):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")
