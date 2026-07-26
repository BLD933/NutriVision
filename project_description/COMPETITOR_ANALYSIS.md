# Competitor Analysis — NutriVision AI Agent

> Research conducted for the **Build with Gemma Hackathon 2026** (GDG ENSAB)
> Searched: GitHub, Kaggle, arXiv, web — July 2026

---

## 🚨 Tier 1: Direct Competitors (Same Hackathon / Same Concept)

These projects target the **exact same problem** — food photo → Gemma-powered nutrition coaching — and some were even submitted to Gemma hackathons.

| Project | Stars | Stack | Threat Level |
|---------|-------|-------|-------------|
| [rohanjain1648/nutrivision](https://github.com/rohanjain1648/nutrivision) | — | Gemma 4 E4B + Ollama + Unsloth | 🔴 **Very High** |
| [SreeManas/google-gemma-hacathon](https://github.com/SreeManas/google-gemma-hacathon) | — | Gemma 4 E4B Vision + React + Python | 🔴 **High** |
| **Gemma Bite** (Kaggle) | — | Gemma 4 + Android, on-device | 🔴 **High** |
| [Stellife/GemYum](https://github.com/Stellife/GemYum) | ★2 | Gemma 3n + Android (Kaggle) | 🟡 Medium |
| [phoenixdev100/CyberKnights-NutriVision](https://github.com/phoenixdev100/CyberKnights-NutriVision) | ★9 | TF/Keras + Django + CNN | 🟡 Medium |
| [DeependraVerma/NutriVision-FoodRecognition](https://github.com/DeependraVerma/NutriVision-FoodRecognition) | ★9 | Python + Streamlit | 🟡 Medium |
| [detluck/nutrivision](https://github.com/detluck/nutrivision) | ★3 | TensorFlow + Django | 🟡 Low |
| [Sahildeogade03/NutriVision](https://github.com/Sahildeogade03/NutriVision) | ★3 | Streamlit + Groq Llama-3 + OCR | 🟡 Low |

### rohanjain1648/nutrivision — Detailed Analysis

- **Name:** NutriVision Agent (same name!)
- **Event:** Kaggle Gemma 4 Good Hackathon (Open Innovation / Multimodal Track)
- **Concept:** Upload a food photo → Gemma 4 identifies food, looks up nutrition, logs to a journal, tracks goals, suggests meals — all via agentic tool-chaining
- **Tech:** Gemma 4 E4B, Ollama (100% offline), Python, Unsloth fine-tune
- **Missing vs your NutriVision:** No YOLOv8-seg (uses pure MLLM vision), no medical RAG (WHO/ADA/HAS), no portion estimation from pixel masks, no Moroccan cuisine focus, no multi-agent architecture

### SreeManas/google-gemma-hacathon — Details

- **Concept:** Food recognition, real-time nutrition analysis, personalized AI coaching, multilingual
- **Tech:** Gemma 4 E4B Vision Model, web app
- **Missing:** No YOLO segmentation, no medical RAG, no local cuisine focus

---

## 🟡 Tier 2: Partially Similar Projects

These solve related problems but with different tech stacks or narrower scope.

| Project | Approach | Key Difference from NutriVision |
|---------|----------|-------------------------------|
| **NutrifyAI** (arXiv 2408.10532) | YOLOv8 + Edamam API | No LLM, no RAG, no Gemma |
| **ChinmayGawad/nutrivision-capstone** | YOLOv8 + offline DB + Edamam | No LLM, no RAG, no Gemma |
| **Dakshin10/NutriCrew** | Groq Vision + CrewAI multi-agent | No YOLO, no Gemma, no medical RAG |
| **FoodLens-AI** | Groq Llama 4 Vision + Gradio | No YOLO, no RAG, no medical guidelines |
| **DietAI24** (Nature Comms Med 2025) | MLLM + RAG (FNDDS database) | Research only, no YOLO, no cultural focus |
| **AccuNutri-AI** | RAG + LLM + Streamlit | No YOLO, no multi-agent, basic |
| **BhojanAI** | YOLOv8 + Indian cuisine | No LLM, no RAG, no medical guidelines |
| **NutriSnap AI** (Medium article) | Gemini 2.0 Flash Vision | No YOLO, no Gemma, no medical RAG |
| **Nutri-Vision-AI** (bejranonda) | Llama 3.2 + Cloudflare Workers | No Gemma, no YOLO, Thai-focused |
| **CIS264-NutritionAI/NutriVision** | OCR + label scanning | Different approach entirely |
| **malhar072142/NutriVision** | CV + generative AI | No specific model info, no RAG |

---

## 🔵 Tier 3: General Food & Nutrition Open-Source Projects

- **food-detection-yolov5** (aifork) — Deprecated YOLOv5 food detection + Edamam
- **OpenNutriTracker** — Manual calorie tracker (no AI)
- **Open Food Facts** — Open barcode-scanning food database
- **NutriLens.AI** — YOLOv8 + Flask food detection
- **CalorieEstimator** — .NET MAUI + LLM calorie estimation

---

## ✅ What Makes NutriVision Unique (Your Competitive Moats)

| Feature | NutriVision | rohanjain nutrivision | Others |
|---------|------------|----------------------|--------|
| **YOLOv8-seg** (segmentation) | ✅ Pixel masks → portion estimation | ❌ Pure MLLM vision | ❌ Mostly detection only |
| **Medical RAG** (WHO/ADA/HAS) | ✅ Standard medical guidelines | ❌ | ❌ DietAI24 has FNDDS only |
| **Moroccan cuisine** (+ HAS Maroc) | ✅ Couscous, tajine, harira, msemen... | ❌ | ❌ BhojanAI (Indian) only |
| **Multi-agent (6 agents)** | ✅ Supervisor, Vision, Nutrition, RAG, Memory, Reasoning | ❌ Single agent chain | ❌ NutriCrew has multi-agent but no YOLO |
| **Chronic disease focus** | ✅ Diabetes, hypertension, kidney, obesity | ❌ General nutrition | ❌ |
| **Trilingual** (AR/FR/EN) | ✅ Darija, French, English | ❌ | ❌ |
| **Explainable AI** (sources cited) | ✅ Every recommendation cites its RAG source | ❌ | ❌ |

---

## 📊 Verdict

**Your project is not "already built" in the exact same form.** The closest competitor (`rohanjain1648/nutrivision`) shares the name and high-level concept but lacks your core differentiators:

1. **YOLOv8-seg** for real portion estimation (vs. guessing from MLLM vision)
2. **Medical RAG grounding** with WHO/ADA/HAS Morocco (vs. generic nutrition lookup)
3. **Moroccan cultural adaptation** (cuisine + local health authority guidelines)
4. **6-agent architecture** orchestrated by Gemma

**Recommendation:** Lead with these differentiators in your pitch. Emphasize the **medical safety** (RAG-grounded, hallucination-free advice) and **local relevance** (Morocco-specific) — these are the strongest moats against competitors.
