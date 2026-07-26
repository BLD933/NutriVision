# NutriVision - AI Nutrition Assistant

[![Hackathon](https://img.shields.io/badge/hackathon-Kaggle-brightgreen)](https://www.kaggle.com/competitions)

NutriVision is an AI-powered nutrition assistant that analyzes food photos, provides personalized recommendations, and helps manage meal planning for health conditions.

## Features

- **Food Detection**: MFOOD YOLO model detects 70 Moroccan food dishes
- **AI Analysis**: Gemma 4B provides detailed nutritional analysis
- **Personalized Recommendations**: Tailored advice based on health conditions
- **Meal Planning**: Generate weekly meal plans with dietary restrictions
- **Recipe Generation**: AI-powered recipe creation from ingredients

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Flask (Python), Firebase Auth
- **AI Models**: 
  - MFOOD YOLOv8 (food detection)
  - Gemma 4B (nutritional analysis)
- **Database**: Firestore (user profiles, analysis history)

## Quick Start

```bash
# Clone
git clone https://github.com/your-org/nutrivision.git
cd nutrivision

# Backend
cd agent
source venv/bin/activate
pip install -r requirements.txt
python app.py  # Runs on port 5000

# Frontend
cd ../ilyas2/agent/agent/frontend-react
npm install
npm run dev  # Runs on port 5173
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyse` | POST | Analyze food photo (multipart form with `image` field) |
| `/api/chat/stream` | POST | Stream chat with NutriBot (SSE) |
| `/api/clients/plan` | POST | Generate personalized health plan |
| `/api/recipes/generate` | POST | Generate recipe from ingredients |
| `/api/meal-plan/generate/stream` | POST | Generate weekly meal plan (SSE) |

## Environment Variables

### Backend (`agent/.env`)
```
FIREBASE_SERVICE_ACCOUNT_KEY=<json-key>
GEMINI_API_KEY=<optional-for-cloud-gemma>
```

### Frontend (`ilyas2/agent/agent/frontend-react/.env`)
```
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_AUTH_DOMAIN=<domain>
VITE_FIREBASE_PROJECT_ID=<id>
VITE_FIREBASE_STORAGE_BUCKET=<bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<id>
VITE_FIREBASE_APP_ID=<id>
```

## Development

```bash
# Run tests
cd agent
pytest tests/

# Lint
npm run lint  # Frontend
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- MFOOD dataset for food detection
- Gemma model by Google
- Firebase for authentication