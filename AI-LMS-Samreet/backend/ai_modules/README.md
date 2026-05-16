# EduAI LMS — AI Modules

**Developer:** Samreet Kaur | B.Tech CSE 2022–2026 | Amritsar Group of Colleges

This folder contains all AI/ML modules for the EduAI LMS platform.

---

## Modules

| File | Description | Algorithm |
|---|---|---|
| `recommendation_engine.py` | Course recommendation system | SVD + TF-IDF Cosine Similarity |
| `early_warning_system.py` | At-risk student prediction | Gradient Boosting (XGBoost/LightGBM) |

---

## Setup

```bash
pip install numpy pandas scikit-learn
python recommendation_engine.py
python early_warning_system.py
```

---

## Integration with Backend

These modules are served as REST API endpoints via **Python FastAPI** and consumed by the Node.js backend.

```
POST /api/ai/recommend       → Get course recommendations for a student
POST /api/ai/predict-risk    → Predict at-risk probability for a student
GET  /api/ai/alerts          → Get all active instructor alerts
```

---

*Part of AI-Based LMS — B.Tech Final Year Project, Samreet Kaur (2233713)*
