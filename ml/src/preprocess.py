"""
preprocess.py
─────────────
Filters PlantVillage dataset to target plants,
creates ImageDataGenerators with augmentation,
and saves class_labels.json.
"""

import os
import json
import shutil
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ── Config ────────────────────────────────────────────────────────────────────
IMG_SIZE   = (224, 224)
BATCH_SIZE = 32
RAW_DIR    = "data/raw/PlantVillage"
OUT_DIR    = "data/processed/all"
TARGET_PLANTS = ["Tomato", "Potato", "Corn_(maize)"]


def filter_and_copy(src_dir: str, out_dir: str, targets: list) -> list:
    """Copy only target plant class folders into out_dir."""
    os.makedirs(out_dir, exist_ok=True)
    classes = []
    for folder in sorted(os.listdir(src_dir)):
        if any(folder.startswith(p) for p in targets):
            dst = os.path.join(out_dir, folder)
            if not os.path.exists(dst):
                shutil.copytree(os.path.join(src_dir, folder), dst)
                print(f"  ✔ Copied: {folder}")
            classes.append(folder)
    print(f"\n✅ {len(classes)} classes ready in {out_dir}")
    return classes


def create_generators(data_dir: str):
    """
    Returns (train_gen, val_gen) with augmentation on train.
    Also writes class_labels.json.
    """
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        horizontal_flip=True,
        vertical_flip=False,
        fill_mode="nearest",
    )
    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
    )

    train_gen = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        subset="training",
        class_mode="categorical",
        shuffle=True,
        seed=42,
    )
    val_gen = val_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        subset="validation",
        class_mode="categorical",
        shuffle=False,
        seed=42,
    )

    # Save index → class_name map
    index_to_class = {str(v): k for k, v in train_gen.class_indices.items()}
    with open("class_labels.json", "w") as f:
        json.dump(index_to_class, f, indent=2)
    print(f"✅ class_labels.json written ({len(index_to_class)} classes)")

    return train_gen, val_gen


if __name__ == "__main__":
    filter_and_copy(RAW_DIR, OUT_DIR, TARGET_PLANTS)
    train_gen, val_gen = create_generators(OUT_DIR)
    print(f"Train batches : {len(train_gen)}")
    print(f"Val   batches : {len(val_gen)}")
    print(f"Classes       : {list(train_gen.class_indices.keys())}")
