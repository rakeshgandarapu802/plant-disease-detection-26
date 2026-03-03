# 🌿 Plant Disease Detection System

A full-stack ML application that detects diseases in **Tomato, Potato, and Corn** leaves using deep learning, and provides remedy suggestions to farmers and home gardeners.

---

## 🏗️ Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| ML        | Python, TensorFlow, MobileNetV2 |
| ML API    | Flask (microservice on :5001) |
| Backend   | Java 17, Spring Boot 3, MySQL |
| Frontend  | React.js 18, Recharts, jsPDF |
| Deploy    | Docker Compose               |

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
# 1. Train model first (required!)
cd ml
pip install -r requirements.txt
python src/train.py

# 2. Start all services
cd ..
docker-compose up --build
```

Open http://localhost:3000

---

### Option B — Manual

**Step 1: Train the ML model**
```bash
cd ml
pip install -r requirements.txt
# Download PlantVillage from Kaggle:
kaggle datasets download -d emmarex/plantdisease
unzip plantdisease.zip -d data/raw/
python src/train.py
```

**Step 2: Start Flask ML service**
```bash
python flask_service.py
# → http://localhost:5001
```

**Step 3: Create MySQL database**
```sql
CREATE DATABASE plant_disease_db;
```

**Step 4: Start Spring Boot backend**
```bash
cd backend
# Edit src/main/resources/application.properties with your DB password
mvn spring-boot:run
# → http://localhost:8080
```

**Step 5: Start React frontend**
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## 📁 Folder Structure

```
plant-disease-detection/
├── ml/                         # Python ML
│   ├── src/
│   │   ├── preprocess.py       # Data pipeline
│   │   ├── model.py            # MobileNetV2 architecture
│   │   ├── train.py            # 2-phase training
│   │   ├── evaluate.py         # Metrics & plots
│   │   └── predict.py          # CLI inference
│   ├── flask_service.py        # Inference microservice
│   ├── class_labels.json       # Class index → name map
│   ├── remedies.json           # Disease → remedy map
│   └── requirements.txt
│
├── backend/                    # Spring Boot
│   └── src/main/java/com/plantdisease/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── model/              # JPA entities
│       ├── repository/         # Spring Data repos
│       ├── security/           # JWT filter + util
│       └── config/             # Security + RestTemplate
│
├── frontend/                   # React.js
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Route pages
│       ├── api/                # Axios API layer
│       └── styles/             # Global CSS
│
└── docker-compose.yml
```

---

## 🌿 Supported Diseases (13 Classes)

| Plant  | Disease                          |
|--------|----------------------------------|
| Tomato | Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Mosaic Virus, Healthy |
| Potato | Early Blight, Late Blight, Healthy |
| Corn   | Common Rust, Gray Leaf Spot, Northern Leaf Blight, Healthy |

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| POST   | /api/v1/auth/register       | Register new user               |
| POST   | /api/v1/auth/login          | Login → returns JWT token       |
| POST   | /api/v1/predict             | Upload image → get prediction   |
| GET    | /api/v1/history             | Get user prediction history     |
| GET    | /api/v1/stats               | Get disease frequency stats     |
| GET    | /api/v1/dashboard           | Get user summary counts         |

---

## 📊 Expected Model Performance

| Metric               | Value      |
|----------------------|------------|
| Training Accuracy    | ~97%       |
| Validation Accuracy  | ~95%       |
| Inference Speed      | ~80ms/img  |
| Model Size           | ~14 MB     |

---

## 📝 Notes

- Place the trained `plant_disease_model.h5` in `ml/models/` before running Flask.
- Update `backend/src/main/resources/application.properties` with your MySQL credentials.
- JWT secret should be changed in production.
- The Flask service must be running before Spring Boot starts.
