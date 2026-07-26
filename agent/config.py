import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

_FIREBASE_KEY = os.path.join(
    os.path.dirname(__file__),
    "..",
    "nutrivision-20405-firebase-adminsdk-fbsvc-c64b594c9b.json",
)
cred = credentials.Certificate(_FIREBASE_KEY)
firebase_admin.initialize_app(cred)
db = firestore.client(database_id="nutrivision")

