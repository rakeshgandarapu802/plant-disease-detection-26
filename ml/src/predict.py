"""
predict.py
──────────
Run inference on a single image from command line.

Usage:
  cd ml
  python src/predict.py path/to/leaf.jpg
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import json
import numpy as np
import tensorflow as tf
from PIL import Image


MODEL_PATH  = "models/plant_disease_model.h5"
LABELS_PATH = "class_labels.json"
REMEDY_PATH = "remedies.json"
IMG_SIZE    = (224, 224)


def load_resources():
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LABELS_PATH) as f:
        labels = json.load(f)      # {"0": "Tomato_Early_Blight", ...}
    with open(REMEDY_PATH) as f:
        remedies = json.load(f)
    return model, labels, remedies


def preprocess(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def predict(image_path: str):
    model, labels, remedies = load_resources()
    tensor = preprocess(image_path)
    preds  = model.predict(tensor, verbose=0)[0]

    top_idx      = int(np.argmax(preds))
    confidence   = float(np.max(preds)) * 100
    disease      = labels[str(top_idx)]
    remedy       = remedies.get(disease, "Consult a local agronomist.")
    is_healthy   = "healthy" in disease.lower()

    # Top-3
    top3_idx = np.argsort(preds)[::-1][:3]
    top3 = [
        {"class": labels[str(i)], "confidence": round(float(preds[i]) * 100, 2)}
        for i in top3_idx
    ]

    result = {
        "disease":    disease,
        "confidence": round(confidence, 2),
        "is_healthy": is_healthy,
        "remedy":     remedy,
        "top3":       top3,
    }

    print("\n" + "="*50)
    print("🌿 PREDICTION RESULT")
    print("="*50)
    print(f"Disease    : {disease.replace('_', ' ')}")
    print(f"Confidence : {confidence:.2f}%")
    print(f"Status     : {'✅ Healthy' if is_healthy else '⚠️  Diseased'}")
    print(f"\n📋 Remedy:\n  {remedy}")
    print("\n📊 Top 3 predictions:")
    for i, t in enumerate(top3, 1):
        print(f"  {i}. {t['class'].replace('_',' '):<35} {t['confidence']}%")
    print("="*50)
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/predict.py <image_path>")
        sys.exit(1)
    predict(sys.argv[1])
