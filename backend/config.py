import os
import json
from pathlib import Path

from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth

load_dotenv()

_firebase_key_raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
if _firebase_key_raw:
    cred = credentials.Certificate(json.loads(_firebase_key_raw))
else:
    _firebase_key_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "nutrivision-20405-firebase-adminsdk-fbsvc-c64b594c9b.json",
    )
    cred = credentials.Certificate(_firebase_key_path)

firebase_admin.initialize_app(cred)
db = firestore.client(database_id="nutrivision")
