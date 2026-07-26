from config import db
from agents.nutrition_agent import NutritionAgent
from agents.memory_agent import MemoryAgent
from agents.rag_agent import retrieve
from agents.gemma_agent import ask_gemma
from datetime import datetime


class SupervisorAgent:
    def __init__(self, vision_agent, nutrition_agent=None, memory_agent=None):
        self.vision = vision_agent
        self.nutrition = nutrition_agent or NutritionAgent()
        self.memory = memory_agent or MemoryAgent()

    def process(self, image_bytes: bytes, user_id: str) -> dict:
        profil_snap = db.collection("users").document(user_id).get()
        if not profil_snap.exists:
            db.collection("users").document(user_id).set({
                "email": "", "age": 25, "poids_kg": 70,
                "taille_cm": 170, "sexe": "non spécifié",
                "pathologie": "none", "calories_limit": 2000,
                "sodium_limit_mg": 2000,
            })
            profil = {"email": "", "age": 25, "poids_kg": 70,
                      "taille_cm": 170, "sexe": "non spécifié",
                      "pathologie": "none", "calories_limit": 2000,
                      "sodium_limit_mg": 2000}
        else:
            profil = profil_snap.to_dict()

        vision_result = self.vision.analyze(image_bytes)
        aliments = vision_result.get("aliments", [])
        nutriments_repas = vision_result.get("nutriments_repas", {})

        history = self.memory.get_context(user_id)

        nutrition_result = self.nutrition.evaluate(aliments, profil)
        food_names = ", ".join(a.get("nom", "") for a in aliments)

        pathologie = profil.get("pathologie", "")
        rag_docs = retrieve(query=food_names, pathologie=pathologie, n=3)

        patho_context = ""
        if pathologie and pathologie != "none":
            patho_context = f"Pathologie du patient : {pathologie}. "

        question = (
            f"Analyse ce repas en 4 sections. {patho_context}"
            f"Aliments détectés : {food_names}. "
            f"Calories totales : {nutrition_result.get('totals', {}).get('calories', '?')} kcal. "
            f"Score santé : {nutrition_result.get('score', '?')}/100.\n"
            f"1. **Résumé nutritionnel** — points forts et points faibles.\n"
            f"2. **Recommandations santé** — conseils personnalisés.\n"
            f"3. **Risques** — aliments à surveiller.\n"
            f"4. **Suggestions** — comment améliorer ce repas.\n"
        )

        gemma_reponse = ask_gemma(
            question=question,
            nutrition_ctx={
                "aliments": [a.get("nom") for a in aliments],
                "totals": nutrition_result.get("totals", {}),
                "score": nutrition_result.get("score", 100),
            },
            profil=profil,
            rag_docs=rag_docs,
            num_predict=512,
        )

        meal_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "aliments": aliments,
            "nutriments_repas": nutriments_repas,
            "warnings": nutrition_result.get("warnings", []),
            "score": nutrition_result.get("score", 100),
            "gemma_response": gemma_reponse,
            "rag_sources": rag_docs,
        }
        db.collection("meals").add(meal_data)

        return {
            "aliments": aliments,
            "nutriments_repas": nutriments_repas,
            "analyse": nutrition_result,
            "histoire": history,
            "rag_docs": rag_docs,
            "gemma_reponse": gemma_reponse,
        }
