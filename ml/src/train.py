"""
train.py
────────
Two-phase training:
  Phase 1 – Head only (10 epochs)
  Phase 2 – Fine-tune top-30 layers (15 epochs)

Usage:
  cd ml
  python src/train.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger,
)

from preprocess import create_generators, OUT_DIR
from model import build_model, unfreeze_for_finetuning

# ── Paths ─────────────────────────────────────────────────────────────────────
MODEL_DIR   = "models"
BEST_H5     = os.path.join(MODEL_DIR, "best_model.h5")
FINAL_H5    = os.path.join(MODEL_DIR, "plant_disease_model.h5")
PLOT_PATH   = os.path.join(MODEL_DIR, "training_plot.png")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load data ─────────────────────────────────────────────────────────────────
print("Loading data generators...")
train_gen, val_gen = create_generators(OUT_DIR)
NUM_CLASSES = train_gen.num_classes
print(f"Number of classes: {NUM_CLASSES}")

# ── Build model ───────────────────────────────────────────────────────────────
model, base = build_model(NUM_CLASSES)
model.summary()

# ── Callbacks ─────────────────────────────────────────────────────────────────
def get_callbacks(phase: int):
    return [
        ModelCheckpoint(
            BEST_H5, monitor="val_accuracy",
            save_best_only=True, verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss", patience=8,
            restore_best_weights=True, verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.5,
            patience=3, min_lr=1e-7, verbose=1,
        ),
        CSVLogger(os.path.join(MODEL_DIR, f"phase{phase}_log.csv")),
    ]

# ── Phase 1 ───────────────────────────────────────────────────────────────────
print("\n" + "="*50)
print("PHASE 1 – Training classification head only")
print("="*50)
history1 = model.fit(
    train_gen,
    epochs=10,
    validation_data=val_gen,
    callbacks=get_callbacks(1),
)

# ── Phase 2 ───────────────────────────────────────────────────────────────────
print("\n" + "="*50)
print("PHASE 2 – Fine-tuning top 30 layers")
print("="*50)
model = unfreeze_for_finetuning(model, base, lr=1e-5)
history2 = model.fit(
    train_gen,
    epochs=15,
    validation_data=val_gen,
    callbacks=get_callbacks(2),
)

# ── Save final model ──────────────────────────────────────────────────────────
model.save(FINAL_H5)
print(f"\n✅ Model saved → {FINAL_H5}")

# ── Plot accuracy & loss ──────────────────────────────────────────────────────
def merge(h1, h2, key):
    return h1.history[key] + h2.history[key]

acc   = merge(history1, history2, "accuracy")
v_acc = merge(history1, history2, "val_accuracy")
loss  = merge(history1, history2, "loss")
v_loss= merge(history1, history2, "val_loss")
phase_boundary = len(history1.history["accuracy"])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("Plant Disease Detection – Training History", fontsize=14, fontweight="bold")

for ax, train_vals, val_vals, title in [
    (ax1, acc,  v_acc,  "Accuracy"),
    (ax2, loss, v_loss, "Loss"),
]:
    ax.plot(train_vals, label="Train", color="#4ade80", linewidth=2)
    ax.plot(val_vals,   label="Val",   color="#f87171", linewidth=2)
    ax.axvline(phase_boundary - 1, color="#fbbf24", linestyle="--", alpha=0.7, label="Fine-tune start")
    ax.set_title(title, fontweight="bold")
    ax.set_xlabel("Epoch")
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(PLOT_PATH, dpi=150)
print(f"✅ Training plot saved → {PLOT_PATH}")
