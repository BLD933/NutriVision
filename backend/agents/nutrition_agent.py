class NutritionAgent:
    def __init__(self):
        self.limits_defaults = {
            "calories": 2000,
            "proteines_g": 50,
            "glucides_g": 260,
            "lipides_g": 65,
            "sel_g": 6.0,
            "fibres_g": 25,
        }

    def _bmr_mifflin(self, weight_kg: float, height_cm: float, age: int, sex: str) -> float:
        if sex.lower() == "homme":
            return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    def _check_limits(self, totals: dict, profil: dict) -> list:
        warnings = []
        patho = (profil.get("pathologie") or "").lower()
        has_ht = "hypertension" in patho
        has_dm = "diabète" in patho or "diabetes" in patho

        rules = []

        cal_limit = profil.get("calories_limit") or 2000
        rules.append(("calories", cal_limit, "⚠️ Ce repas dépasse {pct}% de votre limite calorique quotidienne ({limite} kcal)."))

        sodium_limit = profil.get("sodium_limit_mg") or 2000
        sodium_msg = "⚠️ Ce repas contient {pct}% de votre limite de sodium quotidienne ({limite}g). Attention "
        sodium_msg += "hypertension." if has_ht else "régime."
        rules.append(("sel_g", sodium_limit / 1000, sodium_msg))

        sugar_limit = profil.get("sugar_limit_g") or 90
        sugar_msg = "⚠️ Glucides à {pct}% de votre limite ({limite}g)."
        if has_dm:
            sugar_msg += " Diabétique : surveiller la glycémie."
        rules.append(("glucides_g", sugar_limit, sugar_msg))

        for key, limite, template in rules:
            val = totals.get(key, 0)
            if val > limite:
                pct = round((val / limite) * 100)
                warnings.append({
                    "type": key,
                    "message": template.format(pct=pct, limite=limite),
                    "severity": "high" if pct > 120 else "medium",
                    "value": val,
                    "limit": limite,
                    "percent": pct,
                })

        return warnings

    def evaluate(self, aliments: list, profil: dict) -> dict:
        base = {}
        for k in self.limits_defaults:
            base[k] = 0
        for item in aliments:
            for k in base:
                base[k] += (item.get("nutriments") or {}).get(k, 0)
        totals = {k: round(v, 1) for k, v in base.items()}

        bmr = self._bmr_mifflin(
            weight_kg=profil.get("weight", 70),
            height_cm=profil.get("height", 170),
            age=profil.get("age", 30),
            sex=profil.get("sex", "homme"),
        )

        warnings = self._check_limits(totals, profil)

        score = 100
        for w in warnings:
            if w["severity"] == "high":
                score -= 20
            else:
                score -= 10
        score = max(0, score)

        return {
            "bmr": round(bmr, 1),
            "totals": totals,
            "limits": {
                "calories": profil.get("calories_limit") or 2000,
                "sodium_mg": profil.get("sodium_limit_mg") or 2000,
                "sugar_g": profil.get("sugar_limit_g") or 90,
            },
            "warnings": warnings,
            "score": score,
        }
