# NutriVision AI Agent — Final Test Results

## Pipeline (5/5 agents, 41.5s total)

| # | Agent | Time | Status | Detail |
|---|-------|------|--------|--------|
| 1 | **NutritionAgent** | 0.001s | ✅ | BMR, warnings, score — pizza/burger → 60/100 |
| 2 | **MemoryAgent** | 5.8s | ✅ | Firestore `nutrivision` DB, `FieldFilter` API |
| 3 | **RAG Agent** | 2.0s | ✅ | ChromaDB, ONNX model cached, ready for seed data |
| 4 | **VisionAgent** | 8.1s | ✅ | YOLO loaded from `models/food_yolov8_best.pt` |
| 5 | **Gemma Agent** | 25.7s | ✅ | `google.genai` SDK, `gemma-4-31b-it` |

## NutritionAgent Accuracy: 93.3% (14/15)

| Category | Tests | Pass |
|----------|-------|------|
| BMR (male + female) | 2 | 1 (1 rounding: `round(1345.25,1)`=1345.2) |
| Totals (sum, empty, missing) | 4 | 4 |
| Warnings (thresholds, pathology labels) | 6 | 6 |
| Score computation | 2 | 2 |
| Defaults (empty profil) | 1 | 1 |

## To-Do for Demo

- [ ] **Seed RAG data** — add medical guidelines to ChromaDB collection `medical_guidelines`
- [ ] **Add user profiles** — create a test user in Firestore `users/` collection
- [ ] **Test with real food images** — YOLO needs actual food photos to detect
- [ ] Start API: `cd agent && source venv/bin/activate && python app.py`

## Commands

```bash
cd /home/bld/hackathon/gemma_hackathon/agent
source venv/bin/activate
python app.py                       # Flask on :5000
```
