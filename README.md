# CottonYield AI — Cotton Fiber Yield Prediction

AI-powered mobile app for predicting cotton fiber yield using an explainable machine learning ensemble.

**FYP Project · BZU Multan**

---

## 🌿 Tech Stack

- **Frontend:** React Native (Expo SDK 54)
- **Backend:** Python FastAPI
- **Database & Auth:** Supabase (PostgreSQL)
- **ML:** Stacking Ensemble (Random Forest + XGBoost + LightGBM + Gradient Boosting) with SHAP explainability

---

## ✨ Features

- **5-input yield prediction** — Location, Variety, Irrigation, Nitrogen, Soil
- **Plain-English SHAP explanations** — every prediction is explained with the top contributing factors
- **Username + password authentication** via Supabase Auth
- **Prediction history** — save, view, and delete past predictions
- **Analytics dashboard** — SHAP feature importance, feature group contribution, model leaderboard
- **Variety comparison** — compare all 5 cotton varieties side by side
- **Forgot password / reset** flow
- **Clean, decent UI** — green agricultural theme, professional design

---

## 📊 Model Performance

| Metric | Value |
|---|---|
| Test R² | **0.685** |
| Pearson r (PCC) | **0.916** |
| Test RMSE | **111.4 kg/ha** |
| Generalization gap | **−0.023** (best) |
| Training plots | **480** (4 locations × 2 seasons × 5 varieties × 4 irrigation × 3 nitrogen) |

---

## 🚀 Setup

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn scikit-learn xgboost lightgbm shap pandas numpy scipy joblib python-multipart
# Place fiber_yield_app_model.pkl in this folder
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Mobile App (React Native + Expo)
```bash
cd mobile
npm install
npx expo start
```
Scan QR with Expo Go app on your phone (same WiFi).

---

## 📂 Project Structure

cotton-yield-app/
├── backend/
│   ├── main.py                     # FastAPI server with /predict route
│   └── fiber_yield_app_model.pkl   # Trained model bundle (not in repo)
└── mobile/
├── App.js                      # Navigation root
└── src/
├── SplashScreen.js
├── LoginScreen.js
├── SignupScreen.js
├── ForgotScreen.js
├── HomeScreen.js
├── PredictScreen.js
├── AnalyticsScreen.js
├── VarietiesScreen.js
├── ProfileScreen.js
├── supabase.js
└── theme.js

---

## 👤 Author

**Muavia Ateeq** — FYP Student, Multan
Supervisor: Ma'am Javeria Jabeen