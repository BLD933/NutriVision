import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
from agents.gemma_agent import ask_gemma, ask_gemma_stream

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    message = data.get("message", "")
    nutrition_ctx = data.get("nutrition_ctx", {})
    user_profile = data.get("user_profile", {})
    rag_docs = data.get("rag_docs", "")

    if not message:
        return jsonify({"error": "message field required"}), 400

    response = ask_gemma(
        question=message,
        nutrition_ctx=nutrition_ctx,
        profil=user_profile,
        rag_docs=rag_docs,
    )

    return jsonify({"response": response})


@chat_bp.route("/api/chat/stream", methods=["POST"])
def chat_stream():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    message = data.get("message", "")
    nutrition_ctx = data.get("nutrition_ctx", {})
    user_profile = data.get("user_profile", {})
    rag_docs = data.get("rag_docs", "")

    if not message:
        return jsonify({"error": "message field required"}), 400

    def generate():
        for chunk in ask_gemma_stream(
            question=message,
            nutrition_ctx=nutrition_ctx,
            profil=user_profile,
            rag_docs=rag_docs,
        ):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")
