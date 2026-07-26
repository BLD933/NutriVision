import os
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
from routes.analyse import analyse_bp
from routes.chat import chat_bp

REACT_DIST = os.path.join(os.path.dirname(__file__), "frontend-react", "dist")

app = Flask(__name__, static_folder=REACT_DIST, static_url_path="")
app.config.from_pyfile(".env", silent=True)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(analyse_bp)
app.register_blueprint(chat_bp)


@app.route("/api/health")
def health():
    return {"status": "ok"}


@app.route("/")
def index():
    return send_file(os.path.join(REACT_DIST, "index.html"))


@app.route("/<path:path>")
def catch_all(path):
    file_path = os.path.join(REACT_DIST, path)
    if os.path.isfile(file_path):
        return send_file(file_path)
    return send_file(os.path.join(REACT_DIST, "index.html"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
