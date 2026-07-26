import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

_FIREBASE_KEY = os.path.join(
    os.path.dirname(__file__),
    "..",
    "nutrivision-20405-firebase-adminsdk-fbsvc-2c91ed32d2.json",
)
cred = credentials.Certificate(_FIREBASE_KEY)
firebase_admin.initialize_app(cred)
db = firestore.client(database_id="nutrivision")

from google import genai

_key = os.environ.get("GEMINI_API_KEY")
gemma_client = genai.Client(api_key=_key)
