from flask import Blueprint, request, jsonify
from firebase_admin import auth as firebase_auth

from config import db
from agents.supervisor_agent import SupervisorAgent
from agents.vision_agent import VisionAgent
from agents.nutrition_agent import NutritionAgent
from agents.memory_agent import MemoryAgent

analyse_bp = Blueprint("analyse", __name__)

_supervisor = None


def _get_supervisor():
    global _supervisor
    if _supervisor is None:
        _supervisor = SupervisorAgent(
            vision_agent=VisionAgent(),
            nutrition_agent=NutritionAgent(),
            memory_agent=MemoryAgent(),
        )
    return _supervisor


@analyse_bp.route("/api/analyse", methods=["POST"])
def analyse():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    id_token = auth_header.split(" ", 1)[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        user_id = decoded["uid"]
    except Exception as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401

    if "image" not in request.files:
        return jsonify({"error": "image file required"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()

    result = _get_supervisor().process(image_bytes, user_id)

    return jsonify(result)
