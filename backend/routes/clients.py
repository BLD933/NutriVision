import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
from agents.gemma_agent import ask_gemma, ask_gemma_stream

clients_bp = Blueprint("clients", __name__)


def _build_plan_prompt(client):
    return f"""Generate a personalized 4-week health plan for this client:

Profile:
- Name: {client.get('name', 'N/A')}
- Age: {client.get('age', '?')}
- Sex: {client.get('sex', 'N/A')}
- Weight: {client.get('weight', '?')} kg
- Height: {client.get('height', '?')} cm
- Activity Level: {client.get('activityLevel', 'N/A')}
- Goal: {client.get('goal', 'General health')}
- Pathologies: {client.get('pathologie', 'None')}
- Restrictions: {client.get('restrictions', 'None')}
- Allergies: {client.get('allergies', 'None')}
- Notes: {client.get('notes', 'None')}

For each week, provide:
1. **Diet Plan**: Daily meal plan (breakfast, lunch, dinner, snacks) with specific foods and portion sizes. Respect all pathologies and restrictions.
2. **Workout Plan**: Exercise routines with sets, reps, and rest periods. Must adapt to client's fitness level and medical conditions.
3. **Duration**: How long each session takes.
4. **Weekly Goal**: What to achieve that week.

Format with bullet points and section headers. Use French."""


@clients_bp.route("/api/clients/plan", methods=["POST"])
def generate_plan():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
    client = data.get("client", {})
    if not client.get("name"):
        return jsonify({"error": "client.name is required"}), 400

    prompt = _build_plan_prompt(client)
    response = ask_gemma(
        question=prompt,
        nutrition_ctx={},
        profil={"age": client.get("age"), "pathologie": client.get("pathologie", "none")},
        rag_docs="",
    )

    return jsonify({"plan": response, "client_name": client.get("name")})


@clients_bp.route("/api/clients/plan/stream", methods=["POST"])
def generate_plan_stream():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
    client = data.get("client", {})
    if not client.get("name"):
        return jsonify({"error": "client.name is required"}), 400

    prompt = _build_plan_prompt(client)

    def generate():
        for chunk in ask_gemma_stream(
            question=prompt,
            nutrition_ctx={},
            profil={"age": client.get("age"), "pathologie": client.get("pathologie", "none")},
            rag_docs="",
        ):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")
