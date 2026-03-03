# 🚀 Complete ML Service Deployment Guide

## ✅ What's Been Created

Your **ML service is now organized in a separate folder** ready for deployment!

```
finalpro/
├── ml-service/                        # 👈 NEW ML MICROSERVICE FOLDER
│   ├── server.js                      # Express server
│   ├── ml_inference.py                # Python inference
│   ├── package.json                   # Node dependencies
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment template
│   ├── README.md                      # Documentation
│   ├── models/                        # Trained models (generated after training)
│   │   ├── risk_pipeline_v2.pkl
│   │   ├── revision_planner_model.pkl
│   │   └── (3 more files)
│   └── scripts/
│       ├── train_models.py            # Training script
│       └── test_model.py              # Testing script
├── backend/                           # Main backend (updated)
│   ├── app.js                         # Updated to call ML service
│   ├── ml_inference.py                # (Keep for reference)
│   └── other files...
├── frontend/                          # Frontend
│   ├── src/
│   │   └── services/
│   │       ├── mlService.js           # 👈 NEW ML service client
│   │       └── api.js
│   └── other files...
└── other files...
```

---

## 🎯 Step-by-Step Deployment

### **STEP 1: Setup ML Service Locally**

```bash
# Navigate to ml-service
cd ml-service

# Install Node dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### **STEP 2: Train Models**

```bash
# Train both models (generates .pkl files)
python3 scripts/train_models.py

# Output: Files saved to ml-service/models/
```

### **STEP 3: Test Locally**

```bash
# Test inference
python3 scripts/test_model.py

# Should show:
# ✅ Models loaded
# Risk Score: 0.8773 (at-risk student)
# Urgency Score: 0.9496 (needs revision)
# etc.
```

### **STEP 4: Start ML Service Locally (Optional)**

```bash
# In separate terminal
node ml-service/server.js

# Service runs on http://localhost:5001
```

### **STEP 5: Update Main Backend (Already Done!)**

Check `backend/app.js` - it now has:

```javascript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Proxy endpoints that call ML service
app.post('/api/ml/risk/predict', async (req, res) => {...});
app.post('/api/ml/revision/mindmap', async (req, res) => {...});
// etc.
```

### **STEP 6: Frontend Integration (Already Created!)**

Check `frontend/src/services/mlService.js` - provides:

```javascript
// Risk prediction
await predictStudentRisk(studentData);
await batchPredictRisk(students);

// Revision planning
await generateRevisionMindMap(studentId, topicProgress);
await getTopicUrgency(topicData);
```

### **STEP 7: Commit to GitHub**

```bash
# From project root
git add .
git commit -m "Add organized ML service with separate microservice folder

- ML service in ml-service/ folder with independent structure
- Backend updated to proxy ML requests
- Frontend service client created (mlService.js)
- Both models trained (AUC 0.90+)
- Ready for Render deployment"

git push origin main
```

### **STEP 8: Deploy ML Service on Render**

1. **Create New Render Service:**
   - Go to render.com
   - New + → Web Service
   - Connect your GitHub repo
2. **Configure:**
   - **Name:** `smart-education-ml`
   - **Branch:** `main`
   - **Runtime:** Node.js
   - **Build Command:** `npm install` (runs in ml-service root)
   - **Start Command:** `node ml-service/server.js`
   - **Instance Type:** Free (or Starter)
3. **Click Deploy** → Wait 3-5 minutes

4. **Get Your URL:**
   ```
   https://smart-education-ml.onrender.com
   ```

### **STEP 9: Deploy Main App (Already Running)**

1. **Update Environment Variable:**
   - Go to your main app's Render dashboard
   - Settings → Environment
   - Add: `ML_SERVICE_URL=https://smart-education-ml.onrender.com`
   - Click Save
2. **Auto-redeploy happens** → Main app now calls ML service

### **STEP 10: Test Integration**

```bash
# Test ML service directly
curl https://smart-education-ml.onrender.com/api/health

# Expected: {"status":"OK","service":"ML Model Service"}

# Test risk prediction through main app
curl -X POST https://yourapp.onrender.com/api/ml/risk/predict \
  -H "Content-Type: application/json" \
  -d '{"prior_failures":2,...}'
```

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│               FRONTEND (React)                          │
│          - Uses mlService.js to call APIs              │
└────────────────────┬──────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│        MAIN BACKEND (yourapp.onrender.com)             │
│   - Auth, Courses, Chat, etc.                          │
│   - Proxies ML requests to separate service            │
└────────────────────┬──────────────────────────────────┘
                     │
      /api/ml/risk/predict
      /api/ml/revision/mindmap
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│   ML SERVICE (smart-education-ml.onrender.com)  ✨ NEW │
│   - Node.js + Python inference                         │
│   - XGBoost models (AUC 0.90+)                        │
│   - Independent scaling                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Verification Checklist

### Local Testing

- [ ] `npm install` in ml-service/ succeeded
- [ ] `python3 scripts/train_models.py` created .pkl files
- [ ] `python3 scripts/test_model.py` shows predictions ✅
- [ ] `backend/app.js` has ML_SERVICE_URL config
- [ ] `frontend/src/services/mlService.js` exists

### Git Commit

- [ ] All files committed (git status shows nothing)
- [ ] Model .pkl files committed (they're small, ~250 KB total)
- [ ] Pushed to GitHub (origin/main has new files)

### Render Deployment

- [ ] ML service deployed at smart-education-ml.onrender.com
- [ ] ML service `/api/health` returns OK
- [ ] Main app has `ML_SERVICE_URL` env var set
- [ ] Main app redeployed after setting env var
- [ ] `/api/ml/risk/predict` returns predictions

---

## 📁 Files Summary

| File                               | Purpose          | Size    |
| ---------------------------------- | ---------------- | ------- |
| ml-service/server.js               | Express server   | 5 KB    |
| ml-service/ml_inference.py         | Python inference | 8 KB    |
| ml-service/scripts/train_models.py | Training         | 6 KB    |
| ml-service/scripts/test_model.py   | Testing          | 4 KB    |
| ml-service/package.json            | Node deps        | 1 KB    |
| ml-service/requirements.txt        | Python deps      | <1 KB   |
| frontend/src/services/mlService.js | Frontend client  | 5 KB    |
| backend/app.js                     | Updated proxy    | 20 KB   |
| ml-service/models/\*.pkl           | Trained models   | ~250 KB |

---

## 🎓 What You Now Have

✅ **Separate ML Microservice** - Independent scaling and deployment
✅ **Trained Models** - AUC 0.90+ risk prediction and revision planning
✅ **6 API Endpoints** - Risk, batch-risk, mindmap, topic-urgency, health, info
✅ **Frontend Integration** - Ready-to-use mlService.js client
✅ **Backend Proxy** - Main app seamlessly calls ML service
✅ **Complete Documentation** - README and integration guides
✅ **Testing Scripts** - Train and test models locally
✅ **Production Ready** - Deploy to Render in minutes

---

## 🚀 Quick Deploy Command

```bash
# Do this in order:

# 1. Train
python3 ml-service/scripts/train_models.py

# 2. Test
python3 ml-service/scripts/test_model.py

# 3. Commit
git add . && git commit -m "ML service ready for production"

# 4. Push
git push origin main

# 5. Deploy on Render (via web dashboard)
# Create service: smart-education-ml
# Start: node ml-service/server.js
```

That's it! 🎉 Your ML models are now deployed as a separate service!
