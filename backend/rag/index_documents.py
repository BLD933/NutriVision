
import chromadb
import os

_PERSIST_DIR = os.path.join(os.path.dirname(__file__))

def build_rag():
    client     = chromadb.PersistentClient(path=_PERSIST_DIR)
    collection = client.get_or_create_collection("medical_guidelines")

    docs = [
        {"id":"who_1", "text":"WHO recommends limiting sodium intake to less than 2000mg per day to reduce hypertension risk.", "source":"WHO 2023"},
        {"id":"who_2", "text":"A diet rich in fiber (25-38g per day) helps control blood glucose in diabetic patients.", "source":"WHO 2023"},
        {"id":"who_3", "text":"WHO recommends consuming at least 400g of fruits and vegetables per day for chronic disease prevention.", "source":"WHO 2023"},
        {"id":"who_4", "text":"Reducing saturated fat intake to less than 10% of total energy reduces cardiovascular disease risk.", "source":"WHO 2023"},
        {"id":"who_5", "text":"WHO recommends limiting free sugars to less than 10% of total energy intake per day.", "source":"WHO 2023"},
        {"id":"ada_1", "text":"ADA guidelines: adults with type 2 diabetes should limit carbohydrates to 45-60g per meal.", "source":"ADA 2023"},
        {"id":"ada_2", "text":"ADA recommends patients with diabetes monitor total carbohydrate intake as the primary strategy for glycemic control.", "source":"ADA 2023"},
        {"id":"ada_3", "text":"For hypertension patients, the DASH diet recommends reducing sodium and increasing potassium-rich foods.", "source":"ADA 2023"},
        {"id":"ada_4", "text":"ADA recommends at least 150 minutes of moderate physical activity per week for diabetes management.", "source":"ADA 2023"},
        {"id":"ada_5", "text":"Patients with diabetes should aim for HbA1c below 7% through diet, exercise and medication.", "source":"ADA 2023"},
        {"id":"has_1", "text":"Le couscous a un index glycémique modéré de 65. Consommé avec légumes et protéines, il est adapté aux diabétiques en portion contrôlée.", "source":"HAS Maroc"},
        {"id":"has_2", "text":"La harira est riche en fibres, protéines végétales et fer. Bénéfique pour la glycémie et recommandée pendant le Ramadan.", "source":"HAS Maroc"},
        {"id":"has_3", "text":"Le tajine à base de légumes et viande maigre est adapté aux patients hypertendus si préparé sans sel ajouté.", "source":"HAS Maroc"},
        {"id":"has_4", "text":"Le msemen est riche en glucides rapides (IG élevé). Déconseillé aux diabétiques en grande quantité.", "source":"HAS Maroc"},
        {"id":"has_5", "text":"La bastilla contient beaucoup de sucre et de matières grasses. À éviter pour les patients obèses et diabétiques.", "source":"HAS Maroc"},
        {"id":"has_6", "text":"La bissara est riche en protéines végétales et fibres, recommandée pour diabétiques et hypertendus.", "source":"HAS Maroc"},
        {"id":"has_7", "text":"Le thé à la menthe marocain contient beaucoup de sucre. Les diabétiques doivent le consommer sans sucre.", "source":"HAS Maroc"},
        {"id":"kid_1", "text":"Patients with kidney disease should limit potassium intake to 2000mg/day and phosphorus to 800mg/day.", "source":"Clinical Guidelines"},
        {"id":"kid_2", "text":"Kidney disease patients should limit protein intake to 0.6-0.8g per kg of body weight per day.", "source":"Clinical Guidelines"},
        {"id":"kid_3", "text":"Kidney patients should avoid high potassium foods like bananas, oranges, potatoes and tomatoes.", "source":"Clinical Guidelines"},
        {"id":"obe_1", "text":"For obesity management, a caloric deficit of 500-750 kcal/day leads to 0.5-0.75kg weight loss per week.", "source":"WHO 2023"},
        {"id":"obe_2", "text":"High fiber foods increase satiety and reduce overall calorie intake, beneficial for obesity management.", "source":"WHO 2023"},
        {"id":"obe_3", "text":"Avoiding ultra-processed foods and sugary drinks is essential for obesity prevention and management.", "source":"WHO 2023"},
        {"id":"htn_1", "text":"DASH diet for hypertension: rich in fruits, vegetables, whole grains, low-fat dairy and lean protein.", "source":"ADA 2023"},
        {"id":"htn_2", "text":"Reducing alcohol consumption to less than 2 drinks per day helps lower blood pressure significantly.", "source":"WHO 2023"},
        {"id":"htn_3", "text":"Potassium-rich foods like spinach, avocado and sweet potato help counteract sodium effects on blood pressure.", "source":"Clinical Guidelines"},
    ]

    collection.add(
        ids       = [d["id"]   for d in docs],
        documents = [d["text"] for d in docs],
        metadatas = [{"source": d["source"]} for d in docs]
    )
    print(f"✅ {len(docs)} documents indexés")
    return collection

if __name__ == "__main__":
    build_rag()
