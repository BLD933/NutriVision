Here is the text extracted from each of the provided images:

### **m1.jpeg**

**Membre 1 — Vision & Dataset**
YOLOv8 · OpenCV · Python

FICHIERS À MODIFIER / CRÉER
`routes/vision.py` `02_modele_vision/` `datasets/` `agents/vision_agent.py`

* ✅ **Déjà fait :** YOLOv8-seg fonctionne, détection aliments, estimation portion, NUTRIMENTS_TABLE 60+ aliments
* 🔧 **Ajouter aliments marocains** dans `NUTRIMENTS_TABLE` de `vision.py` : couscous, tajine, harira, msemen, bastilla, rfissa (valeurs déjà données précédemment)
* 🔧 **Créer agents/vision_agent.py** — encapsuler la logique YOLO dans une classe `VisionAgent` avec méthode `analyze(image_bytes)` qui retourne les aliments + portions + nutriments
* 🔧 **Fine-tuner le modèle** sur 100-200 photos de plats marocains annotées sur Roboflow — entraînement sur Kaggle GPU (2h max)
* 📝 **Tester** avec photos couscous / tajine / harira et vérifier que la détection fonctionne correctement

---

### **m2.jpeg**

**Membre 2 — Gemma + RAG**
Gemma · ChromaDB · LangChain

FICHIERS À MODIFIER / CRÉER
`agents/gemma_agent.py` `agents/rag_agent.py` `rag/index_documents.py` `rag/chroma_db/` `routes/chat.py`

* 🔧 **Créer agents/gemma_agent.py** — appel Ollama local avec gemma3, system prompt médical, fonction `ask_gemma(message, nutrition_ctx, user_profile)`
* 🔧 **Créer rag/index_documents.py** — indexer les guidelines WHO, ADA, HAS Maroc dans ChromaDB (commencer avec 20-30 extraits texte)
* 🔧 **Créer agents/rag_agent.py** — fonction `retrieve(query, pathologie)` qui retourne les 3 documents les plus pertinents
* 🔧 **Créer routes/chat.py** — endpoint POST `/api/chat` : reçoit message + contexte nutrition, appelle `rag_agent` puis `gemma_agent`, retourne réponse JSON
* 🔧 **Modifier routes/nutrition.py** — remplacer le bloc `if`/`elif` de conseils statiques par un appel à `gemma_agent` après le calcul nutritionnel
* 📝 **Tester :** photo couscous + profil hypertension → vérifier que Gemma cite WHO et propose une alternative

---

### **m3.jpeg**

**Membre 3 — Backend & Agents**
Flask · PostgreSQL · Python

FICHIERS À MODIFIER / CRÉER
`app.py` `agents/supervisor_agent.py` `agents/memory_agent.py` `agents/nutrition_agent.py` `03_logique_nutritionnelle/recommandation.py`

* ✅ **Déjà fait :** Flask API complète, JWT auth, PostgreSQL, routes vision/nutrition/historique/recettes/barcode
* 🔧 **Créer agents/supervisor_agent.py** — orchestrateur qui reçoit photo + profil, appelle dans l'ordre : `VisionAgent` → `NutritionAgent` → `RAGAgent` → `GemmaAgent` et retourne le résultat final
* 🔧 **Créer agents/memory_agent.py** — classe qui charge l'historique des 7 derniers repas depuis PostgreSQL et construit un résumé de contexte pour Gemma
* 🔧 **Créer agents/nutrition_agent.py** — encapsuler `besoins_mifflin.py` + `moteur_regles.py` dans une classe propre avec méthode `evaluate(aliments, profil)`
* 🔧 **Modifier app.py** — enregistrer le nouveau blueprint `chat_bp` (route `/api/chat` de Membre 2) + connecter le `SupervisorAgent` à la route `/api/analyse`
* 🔧 **Implémenter recommandation.py** — actuellement `raise NotImplementedError`, brancher l'appel Gemma ici

---

### **m4.jpeg**

**Membre 4 — Frontend & Demo**
React · TailwindCSS · Demo

FICHIERS À MODIFIER / CRÉER
`pages/Analyse.jsx` `pages/Dashboard.jsx` `components/ChatWidget.jsx` `api/client.js`

* ✅ **Déjà fait :** Dashboard, Analyse, Profil, Historique, Recettes, Barcode — toutes les pages existent et fonctionnent
* 🔧 **Créer components/ChatWidget.jsx** — composant chat flottant (bouton en bas à droite), zone de messages, input texte, appel POST `/api/chat`, affichage réponse Gemma avec source citée
* 🔧 **Modifier pages/Analyse.jsx** — après analyse YOLO, afficher la réponse Gemma en dessous des nutriments (section "💬 Recommandation Gemma" avec la source WHO/ADA)
* 🔧 **Modifier pages/Dashboard.jsx** — ajouter un bouton "Demander à Gemma" qui ouvre le chat avec contexte du jour pré-rempli
* 🎬 **Préparer la démo hackathon** — scénario précis : photo couscous → détection → Gemma répond en français → chat "puis-je manger ça demain ?" → Gemma répond. Tester 3 fois avant la présentation
* 📝 **Vérifier le README** — mettre les vrais noms, institution, lien GitHub, et ajouter 2-3 captures d'écran de la démo
