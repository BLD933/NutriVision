from flask import Blueprint, request, jsonify
from agents.gemma_agent import ask_gemma

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
