"""
evaluate.py
───────────
Evaluates the trained model and plots:
  - Classification report
  - Confusion matrix
  - Per-class accuracy bar chart

Usage:
  cd ml
  python src/evaluate.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

from preprocess import create_generators, OUT_DIR

# ── Load ──────────────────────────────────────────────────────────────────────
MODEL_PATH = "models/plant_disease_model.h5"
REPORT_DIR = "models/eval"
os.makedirs(REPORT_DIR, exist_ok=True)

print("Loading model and data...")
model = tf.keras.models.load_model(MODEL_PATH)

_, val_gen = create_generators(OUT_DIR)
with open("class_labels.json") as f:
    idx_to_class = json.load(f)
class_names = [idx_to_class[str(i)] for i in range(len(idx_to_class))]

# ── Predictions ───────────────────────────────────────────────────────────────
print("Running predictions on validation set...")
y_pred_probs = model.predict(val_gen, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = val_gen.classes

# ── Classification Report ─────────────────────────────────────────────────────
report = classification_report(y_true, y_pred, target_names=class_names)
print("\n" + "="*60)
print("CLASSIFICATION REPORT")
print("="*60)
print(report)
with open(os.path.join(REPORT_DIR, "classification_report.txt"), "w") as f:
    f.write(report)

# ── Confusion Matrix ──────────────────────────────────────────────────────────
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(16, 13))
sns.heatmap(
    cm, annot=True, fmt="d", cmap="Greens",
    xticklabels=class_names, yticklabels=class_names,
    linewidths=0.5, linecolor="gray",
)
plt.xticks(rotation=45, ha="right", fontsize=8)
plt.yticks(rotation=0, fontsize=8)
plt.title("Confusion Matrix – Plant Disease Detection", fontsize=14, fontweight="bold")
plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "confusion_matrix.png"), dpi=150)
print(f"✅ Confusion matrix saved → {REPORT_DIR}/confusion_matrix.png")

# ── Per-Class Accuracy ────────────────────────────────────────────────────────
per_class_acc = cm.diagonal() / cm.sum(axis=1)
plt.figure(figsize=(12, 5))
bars = plt.bar(class_names, per_class_acc * 100, color="#4ade80", edgecolor="#2a3d2a")
plt.axhline(90, color="#f87171", linestyle="--", linewidth=1.5, label="90% threshold")
plt.xticks(rotation=45, ha="right", fontsize=8)
plt.ylabel("Accuracy (%)")
plt.title("Per-Class Accuracy", fontweight="bold")
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "per_class_accuracy.png"), dpi=150)
print(f"✅ Per-class accuracy chart saved → {REPORT_DIR}/per_class_accuracy.png")

overall_acc = np.mean(y_pred == y_true) * 100
print(f"\n🎯 Overall Validation Accuracy: {overall_acc:.2f}%")
