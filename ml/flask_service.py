"""
flask_service.py
────────────────
Lightweight Flask microservice for ML inference.
Called internally by Spring Boot backend.

Run:
  cd ml
  python flask_service.py
  → http://localhost:5001/predict
"""

import io
import json
import os

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from PIL import Image
from werkzeug.exceptions import BadRequest

# ── App ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

# ── Load model once at startup ─────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(__file__)
MODEL_PATH  = os.path.join(BASE_DIR, "models", "plant_disease_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
REMEDY_PATH = os.path.join(BASE_DIR, "remedies.json")

print("🔄 Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded.")

with open(LABELS_PATH) as f:
    CLASS_LABELS: dict = json.load(f)   # {"0": "Tomato_Early_Blight", ...}

with open(REMEDY_PATH) as f:
    REMEDIES: dict = json.load(f)

IMG_SIZE = (224, 224)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(img_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "plant_disease_model.h5"})


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image field in request"}), 400

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or missing file"}), 400

    try:
        img_bytes = file.read()
        tensor    = preprocess_image(img_bytes)
        preds     = model.predict(tensor, verbose=0)[0]

        top_idx    = int(np.argmax(preds))
        confidence = float(np.max(preds)) * 100
        disease    = CLASS_LABELS[str(top_idx)]
        remedy     = REMEDIES.get(disease, "Consult a local agronomist.")
        is_healthy = "healthy" in disease.lower()

        # Top-3 predictions
        top3_idx = np.argsort(preds)[::-1][:3]
        top3 = [
            {
                "class":      CLASS_LABELS[str(i)],
                "confidence": round(float(preds[i]) * 100, 2),
            }
            for i in top3_idx
        ]

        return jsonify({
            "disease":    disease,
            "confidence": round(confidence, 2),
            "is_healthy": is_healthy,
            "remedy":     remedy,
            "top3":       top3,
            "all_scores": {
                CLASS_LABELS[str(i)]: round(float(preds[i]) * 100, 4)
                for i in range(len(preds))
            },
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/classes", methods=["GET"])
def classes():
    return jsonify({"classes": CLASS_LABELS, "total": len(CLASS_LABELS)})


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
