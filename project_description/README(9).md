<div align="center">

# 🥗 NutriVision AI Agent

### AI-Powered Nutrition Healthcare Agent
### Google Gemma · YOLOv8-seg · RAG · Multi-Agent

[![Gemma](https://img.shields.io/badge/Powered%20by-Google%20Gemma-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Hackathon](https://img.shields.io/badge/GDG%20ENSAB-Build%20with%20Gemma%202026-orange?style=for-the-badge)]()
[![Track](https://img.shields.io/badge/Track-GenAI%20for%20Good%20%7C%20Autonomous%20Agents-green?style=for-the-badge)]()
[![Theme](https://img.shields.io/badge/Theme-🏥%20Healthcare-red?style=for-the-badge)]()

> Built with ❤️ for the **Build with Gemma Hackathon 2026**
> Organized by **GDG ENSAB** · Sponsored by the **Gemma Team**

</div>

---

## 📌 What is NutriVision?

**NutriVision** is an autonomous AI healthcare agent that helps chronic disease patients (diabetes, hypertension, obesity, kidney disease) monitor their nutrition — just by **taking a photo of their meal.**

No manual input. No guessing. Just a picture → instant personalized medical advice from **Google Gemma.**

> ⚠️ Decision-support tool. **Does not replace medical advice.**

---

## 🎯 The Problem

**Millions of patients** must monitor every meal they eat. Current apps force them to manually search food names, estimate portions, and calculate calories — 3 times a day, every day.

This is **slow, inaccurate and discouraging.** Most patients give up within weeks.

### 🇲🇦 In Morocco specifically:
- **26%** of adults have hypertension
- **10.6%** have diabetes  
- **>40%** are overweight or obese

There is **no culturally adapted AI nutrition tool** for Moroccan patients.

---

## 💡 Our Solution

> *"Take a photo. Get personalized medical advice. Powered by Google Gemma."*

```
📷 Photo of meal
      ↓
🔍 YOLOv8-seg — detects & segments every food item
      ↓
⚖️  Portion estimated from pixel masks
      ↓
🧮 Nutritional values computed (USDA FoodData)
      ↓
📚 Medical RAG — retrieves WHO · ADA · HAS guidelines
      ↓
🤖 Gemma — reasons, explains & generates personalized advice
      ↓
💬 Interactive chat  +  📊 Health dashboard
```

---

## 🤖 Why Google Gemma?

**Gemma is not a chatbot layer. Gemma IS the brain of NutriVision.**

Unlike rule-based nutrition apps, Gemma:

| Capability | What Gemma does in NutriVision |
|---|---|
| 🧠 **Medical Reasoning** | Analyzes nutrition against the user's health profile |
| 📚 **RAG Synthesis** | Reads retrieved medical documents before answering |
| 💬 **Natural Explanation** | Explains every recommendation like a real nutritionist |
| 🥗 **Meal Planning** | Generates personalized daily & weekly meal plans |
| 🔄 **Memory** | Learns from user history and eating habits |
| 🌍 **Multilingual** | Responds in Arabic · French · English |

**Gemma reasons before every answer** — making recommendations personalized, explainable and grounded in trusted medical knowledge.

---

## 💬 Gemma in Action — Real Demo

**User uploads a photo of couscous with lamb.**

```
🔍 Vision Agent detects:
   • Couscous    → 320g
   • Lamb        → 150g  
   • Vegetables  → 80g

🧮 Nutrition Agent calculates:
   • 780 kcal  |  45g protein  |  28g fat
   • 92g carbs |  1240mg sodium

👤 User Profile: Hypertension · 58 years old · Sodium limit: 1500mg/day
```

**Gemma response:**

```
⚠️  This meal provides 1240mg of sodium — 83% of your daily limit.
    Lamb is the main sodium source for your hypertension profile.

✅  Great news: the vegetables and fiber content are excellent
    for blood pressure regulation.

💡  Recommendation: Reduce lamb to 80g and avoid added salt.
    According to WHO hypertension guidelines, keeping sodium
    under 2000mg/day reduces blood pressure by 5–6 mmHg.

🍽️  Healthier alternative: Replace lamb with chicken breast —
    same flavors, 40% less sodium, better for your profile.

📚  Sources: WHO Nutrition Guidelines 2023 · HAS Maroc
```

---

## 🏗️ System Architecture

```
                          User
                            │
               📷 Photo + Question + Health Profile
                            │
                     React Frontend
                            │
                     FastAPI Backend
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   Vision Agent       Nutrition Agent     Memory Agent
   (YOLOv8-seg)      (USDA FoodData)    (User Profile
   Food detection     Macro & micro       & History)
   Portion estimate   nutrients
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
                   🔍 Medical RAG Engine
                   ChromaDB + LangChain
                   WHO · ADA · USDA · HAS Maroc
                            │
                            ▼
                🤖 Gemma Reasoning Engine
                  (Supervisor + Reasoning)
                            │
                            ▼
               Personalized Recommendation
                            │
                  💬 Chat  +  📊 Dashboard
```

---

## 🤖 Multi-Agent Architecture

NutriVision is organized into **6 specialized AI agents** orchestrated by Gemma:

```
                   Gemma Supervisor Agent
                           │
    ┌──────────┬───────────┼───────────┬──────────┐
    ▼          ▼           ▼           ▼          ▼
 Vision    Nutrition      RAG       Memory    Reasoning
 Agent       Agent       Agent      Agent      Agent
(YOLO)    (USDA DB)  (ChromaDB)  (Profile)   (Gemma)
```

| Agent | Responsibility |
|---|---|
| **Vision Agent** | Food segmentation, classification, portion estimation |
| **Nutrition Agent** | Calorie & macro/micronutrient calculation |
| **RAG Agent** | Retrieve medical guidelines before every answer |
| **Memory Agent** | Store user history, preferences, allergies, goals |
| **Supervisor Agent** | Gemma orchestrates all agents |
| **Reasoning Agent** | Gemma generates final personalized recommendation |

---

## 📚 Medical RAG — Trusted Sources Only

Gemma **never hallucinates medical advice.**

Before every answer, the RAG Agent retrieves relevant documents from:

- 🌍 WHO Nutrition & Hypertension Guidelines
- 🩺 American Diabetes Association (ADA)
- 🥦 USDA FoodData Central
- 🇲🇦 Moroccan Health Authority (HAS Maroc)
- 📖 Clinical Nutrition Guidelines

Every recommendation includes **which source it came from** — fully explainable AI.

---

## 🔍 Explainable AI — Every Recommendation is Justified

```
Recommendation: ✅ Reduce rice portion by 40%

Why Gemma said this:
  • Detected: 94g carbohydrates in meal
  • Profile: Type 2 Diabetes
  • RAG source: ADA Guideline — max 45-60g carbs per meal
  • Gemma reasoning: "Current carb intake exceeds ADA limit by 57%"

Evidence cited:
  📄 ADA Standards of Medical Care in Diabetes — 2023
  📄 WHO Diet and Chronic Disease Guidelines
```

---

## 👤 User Journey

```
1️⃣  Open NutriVision
2️⃣  Take a photo of the meal
3️⃣  AI detects every food item automatically
4️⃣  Calories & nutrients calculated instantly
5️⃣  RAG retrieves trusted medical guidelines
6️⃣  Gemma analyzes user health profile
7️⃣  Personalized advice generated in seconds
8️⃣  Meal saved to history
9️⃣  Dashboard updates health progress
```

---

## 🚀 Features

### ✅ MVP — Hackathon Demo
- 📷 Food detection & segmentation (YOLOv8-seg)
- ⚖️ Automatic portion estimation
- 🧮 Full nutritional analysis (calories, macros, micros)
- 🤖 Gemma AI nutritionist with RAG
- 💬 Interactive health chat
- 📊 Health dashboard & daily tracking
- 🇲🇦 Moroccan food database (couscous, tajine, harira, msemen...)

### 🔄 Phase 2 — Roadmap
- 📱 Mobile app (Flutter)
- 📷 Barcode scanner & OCR food labels
- 🔊 Voice assistant in Darija & French
- 📉 Blood glucose prediction (LSTM)

### 🚀 Phase 3 — Future Vision
- ⌚ Smartwatch & wearable integration
- 🤝 AI Personal Dietitian
- 🏥 Hospital integration API

---

## 🌍 Moroccan Impact

NutriVision is the **first AI nutrition agent adapted to Moroccan cuisine and health context:**

- ✅ Moroccan food database (local dishes, traditional recipes)
- ✅ HAS Maroc medical guidelines integrated in RAG
- ✅ Arabic · French · Darija language support
- ✅ Affordable & accessible for the Moroccan population

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Generative AI** | Google Gemma (Ollama / Gemma API) |
| **Computer Vision** | YOLOv8-seg (Ultralytics) · OpenCV |
| **RAG** | LangChain · ChromaDB |
| **Backend** | FastAPI (Python 3.10+) |
| **Frontend** | React · TailwindCSS · Chart.js |
| **Nutrition DB** | USDA FoodData Central · PostgreSQL |
| **Deployment** | Docker · Google Cloud |

---

## 📂 Project Structure

```
NutriVision-AI/
│
├── agents/
│     ├── supervisor_agent/       # Gemma orchestrator
│     ├── vision_agent/           # YOLOv8-seg detection
│     ├── nutrition_agent/        # Nutrition calculation
│     ├── rag_agent/              # Medical doc retrieval
│     ├── memory_agent/           # User profile & history
│     └── reasoning_agent/        # Gemma recommendation
│
├── backend/                      # FastAPI REST API
├── frontend/                     # React dashboard
├── models/                       # YOLOv8 weights
├── rag/                          # ChromaDB + indexed medical docs
│     ├── documents/              # WHO, ADA, USDA, HAS PDFs
│     └── index_documents.py      # RAG indexing script
├── datasets/                     # FoodSeg103 → YOLO format
├── docs/                         # Architecture diagrams
├── docker/                       # Docker Compose
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Clone
git clone <repo_url>
cd NutriVision-AI

# 2. Python environment (3.10+)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Pull Gemma model
ollama pull gemma3

# 4. Index medical documents into RAG
python rag/index_documents.py

# 5. Start backend
uvicorn backend.main:app --reload

# 6. Start frontend
cd frontend && npm install && npm start
```

---

## 🏆 Why NutriVision Wins

| Judging Criteria | NutriVision |
|---|---|
| **Gemma Usage** | ✅ Core reasoning engine — not a wrapper |
| **Technical Excellence** | ✅ YOLOv8 + RAG + Multi-Agent + Gemma |
| **Innovation** | ✅ First AI nutrition copilot for Moroccan patients |
| **User Experience** | ✅ Photo → Gemma advice in seconds |
| **Social Impact** | ✅ Helps millions of chronic disease patients |
| **Scalability** | ✅ Docker · Cloud-ready architecture |
| **Explainability** | ✅ Every recommendation cites its RAG source |
| **GenAI for Good** | ✅ Real healthcare problem, real impact |
| **Autonomous Agents** | ✅ 6 specialized agents orchestrated by Gemma |
| **Local Relevance** | ✅ Moroccan cuisine + HAS Maroc guidelines |

---

## 👥 Team

| Name | Role |
|---|---|
| _________________ | AI · Computer Vision · YOLOv8 |
| _________________ | Backend · RAG · Gemma Integration |

**Supervisor:** _________________  
**Institution:** _________________  
**Academic Year:** 2025–2026  
**GitHub:** _________________

---

<div align="center">

**🏆 Build with Gemma Hackathon 2026 — GDG ENSAB**

✅ GenAI for Good &nbsp;|&nbsp; ✅ Autonomous Agents &nbsp;|&nbsp; 🏥 Healthcare

*Built with ❤️ using Google Gemma · YOLOv8-seg · FastAPI · React · ChromaDB*

</div>
