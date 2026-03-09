# 🌿 Plant Disease Detector — Hybrid CNN + Random Forest

A production-grade React frontend for automated plant disease detection using a hybrid deep learning model combining **Convolutional Neural Networks (CNN)** and **Random Forest** ensemble classifiers.

---

## 🚀 Quick Start

```bash
npm install
npm start
```
Opens at **http://localhost:3000**

---

## 📁 Project Structure

```
plant-disease-detector/
├── public/
│   └── index.html
├── src/
│   ├── algorithms/
│   │   ├── cnn.js           ← CNN forward pass (conv, pool, BN, FC, softmax)
│   │   └── randomForest.js  ← Random Forest (Gini, decision trees, voting, fusion)
│   ├── components/
│   │   ├── ImageUploader.js  ← Drag-and-drop real image upload
│   │   ├── CNNVisualizer.js  ← Layer-by-layer CNN architecture view
│   │   ├── RFVisualizer.js   ← Decision tree + vote tally visualization
│   │   ├── HybridFusion.js   ← Late fusion diagram + per-class scores
│   │   └── ResultCard.js     ← Final diagnosis card
│   ├── constants.js          ← Disease classes, colors, severity
│   ├── App.js                ← Main app shell + state management
│   └── index.js              ← React entry point
└── package.json
```

---

## 🧠 CNN Algorithm

Implemented in `src/algorithms/cnn.js`:

- **5 Layers**: Conv1 → MaxPool1 → Conv2 → MaxPool2 → Conv3
- **Activations**: ReLU, Sigmoid, Softmax
- **Batch Normalization** after each conv layer
- **Dropout** (inference mode) before FC layers
- **Fully Connected**: 2 FC layers → 6-class Softmax output
- **Pixel feature extraction** from real uploaded images (RGB stats, green dominance, brightness)

**Key formulas:**
```
Conv:    (f * I)(x,y) = Σᵢ Σⱼ f(i,j) · I(x+i, y+j) + b
ReLU:    f(x) = max(0, x)
BN:      x̂ = (x − μ) / √(σ² + ε)
Softmax: P(yᵢ) = eˢⁱ / Σⱼ eˢʲ
```

---

## 🌲 Random Forest Algorithm

Implemented in `src/algorithms/randomForest.js`:

- **9 Decision Trees** with max depth 3
- **Gini Impurity** for split quality
- **Information Gain** for feature selection
- **10 Handcrafted Features**: color histogram, green dominance, brightness, HOG gradient, texture LBP, edge density, CNN max probability, entropy
- **Majority Voting** for final ensemble prediction
- **Late Fusion** with CNN: `H(x) = 0.6 · P_CNN + 0.4 · P_RF`

**Key formulas:**
```
Gini:    G(t) = 1 − Σᵢ pᵢ²
IG:      IG = G(parent) − Σₖ (|Sₖ|/|S|) · G(Sₖ)
RF Vote: ŷ = argmaxₖ Σₜ 𝟙[hₜ(x) = k]
Fusion:  H(x) = α·P_CNN(y|x) + (1−α)·P_RF(y|x)
```

---

## 🌿 Detectable Conditions

| Disease | Severity | Pathogen |
|---------|----------|---------|
| Healthy | None | — |
| Early Blight | Moderate | Alternaria solani |
| Late Blight | Severe | Phytophthora infestans |
| Powdery Mildew | Mild | Fungal (various) |
| Leaf Rust | Moderate | Puccinia spp. |
| Leaf Spot | Mild | Various |

---

## 📸 Usage

1. Upload any leaf/plant image (JPG, PNG, WebP)
2. Click **Run Analysis**
3. Watch the 5-step pipeline animate in real time
4. Explore **CNN**, **Random Forest**, and **Hybrid Fusion** tabs
5. View the final diagnosis in the Result Card

---

> **Note:** This is a frontend simulation for educational/visualization purposes. Pixel statistics from the real image drive the algorithms, but the weights are randomly initialized (not trained on a real dataset). To connect a real trained model, replace the `runCNN` function with API calls to a backend.
