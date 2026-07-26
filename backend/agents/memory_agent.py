from google.cloud.firestore_v1.base_query import FieldFilter
from config import db
from datetime import datetime, timedelta

class MemoryAgent:
    def __init__(self):
        self.collection = db.collection("meals")

    def get_context(self, user_id: str) -> dict:
        docs = (
            self.collection
            .where(filter=FieldFilter("user_id", "==", user_id))
            .order_by("created_at", direction="DESCENDING")
            .limit(7)
            .stream()
        )
        meals = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            d["created_at"] = d.get("created_at", datetime.utcnow())
            meals.append(d)

        if not meals:
            return {"summary": "Aucun repas enregistré récemment.", "recent_meals": []}

        avg_cals = sum(m.get("nutriments_repas", {}).get("calories", 0) for m in meals) / len(meals)
        avg_sodium = sum(m.get("nutriments_repas", {}).get("sel_g", 0) for m in meals) / len(meals)
        avg_carbs = sum(m.get("nutriments_repas", {}).get("glucides_g", 0) for m in meals) / len(meals)
        avg_protein = sum(m.get("nutriments_repas", {}).get("proteines_g", 0) for m in meals) / len(meals)

        foods_seen = {}
        for m in meals:
            for a in m.get("aliments", []):
                nom = a.get("nom", "?")
                foods_seen[nom] = foods_seen.get(nom, 0) + 1

        most_common = sorted(foods_seen, key=foods_seen.get, reverse=True)[:3]

        summary = (
            f"Sur les 7 derniers repas : moyenne de {avg_cals:.0f} kcal, "
            f"{avg_protein:.1f}g protéines, {avg_carbs:.1f}g glucides, "
            f"{avg_sodium:.2f}g sel par repas. "
            f"Aliments fréquents : {', '.join(most_common)}."
        )

        return {
            "summary": summary,
            "recent_meals": [
                {
                    "id": m["id"],
                    "created_at": m["created_at"].isoformat(),
                    "nutriments_repas": m.get("nutriments_repas"),
                    "aliments": m.get("aliments"),
                }
                for m in meals
            ],
        }
