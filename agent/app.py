from flask import Flask
from routes.analyse import analyse_bp
from routes.chat import chat_bp
from routes.clients import clients_bp
from routes.recipes import recipes_bp
from routes.meal_plan import meal_plan_bp

app = Flask(__name__)
app.config.from_pyfile(".env", silent=True)

app.register_blueprint(analyse_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(clients_bp)
app.register_blueprint(recipes_bp)
app.register_blueprint(meal_plan_bp)


@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
