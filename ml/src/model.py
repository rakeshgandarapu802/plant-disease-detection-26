"""
model.py
────────
MobileNetV2 transfer-learning model for plant disease detection.

Phase 1 – Train classification head only (base frozen).
Phase 2 – Fine-tune top 30 layers of base with low LR.
"""

import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2


def build_model(num_classes: int, img_size: tuple = (224, 224, 3)) -> tuple:
    """
    Returns (model, base_model).
    Base is frozen for Phase-1 training.
    """
    base = MobileNetV2(
        input_shape=img_size,
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # Freeze for Phase 1

    inputs = tf.keras.Input(shape=img_size)
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = Model(inputs, outputs, name="PlantDiseaseNet_v1")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model, base


def unfreeze_for_finetuning(model: Model, base_model, lr: float = 1e-5) -> Model:
    """
    Phase 2: Unfreeze top 30 layers of MobileNetV2 for fine-tuning.
    """
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    # Check how many layers are trainable
    trainable = sum(1 for l in base_model.layers if l.trainable)
    print(f"Fine-tuning: {trainable} layers unfrozen in base model.")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def model_summary(num_classes: int = 13):
    model, _ = build_model(num_classes)
    model.summary()


if __name__ == "__main__":
    model_summary()
