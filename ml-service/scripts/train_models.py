#!/usr/bin/env python3
"""
Standalone ML Model Training Script
Trains both Risk Prediction and Revision Urgency models
Generates .pkl files for backend inference

Run: python ml-service/scripts/train_models.py
Output: Saves to ml-service/models/
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score
from xgboost import XGBClassifier
import joblib
import os
from pathlib import Path

# Ensure models directory exists
MODELS_DIR = Path(__file__).parent.parent / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# Set random seed for reproducibility
np.random.seed(42)

print("=" * 70)
print("🚀 SMART ACADEMIC RISK ENGINE - MODEL TRAINING")
print("=" * 70)

# ============================================================================
# 1. RISK PREDICTION MODEL TRAINING
# ============================================================================

print("\n📊 PHASE 1: Risk Prediction Model Training")
print("-" * 70)

# Generate realistic risk dataset (5000 students)
n_students = 5000
risk_data = pd.DataFrame({
    'prior_failures': np.random.exponential(0.5, n_students).astype(int),
    'study_time': np.random.normal(4, 2, n_students).clip(0, 10).astype(int),
    'absences': np.random.exponential(3, n_students).clip(0, 30).astype(int),
    'parent_edu': np.random.randint(1, 5, n_students),
    'family_support': np.random.randint(1, 5, n_students),
    'health': np.random.randint(1, 5, n_students),
    'internet': np.random.randint(0, 2, n_students),
    'activities': np.random.randint(0, 2, n_students),
    'travel_time': np.random.randint(1, 5, n_students),
    'age': np.random.normal(18, 2, n_students).clip(16, 25).astype(int),
    'paid_support': np.random.randint(0, 2, n_students),
})

# Create risk target
at_risk_prob = (
    (risk_data['prior_failures'] > 0) |
    (risk_data['family_support'] < 2) |
    (risk_data['absences'] > 10) |
    ((risk_data['study_time'] < 2) & (risk_data['parent_edu'] < 3))
)
risk_data['at_risk'] = at_risk_prob.astype(int)

# Add realistic noise (10% flip)
noise_mask = np.random.random(n_students) < 0.10
risk_data.loc[noise_mask, 'at_risk'] = 1 - risk_data.loc[noise_mask, 'at_risk']

print(f"✓ Generated {n_students} student records")
print(f"  At-risk students: {risk_data['at_risk'].sum()} ({risk_data['at_risk'].mean()*100:.1f}%)")

# Split and train
X_risk = risk_data.drop('at_risk', axis=1)
y_risk = risk_data['at_risk']
X_risk_train, X_risk_test, y_risk_train, y_risk_test = train_test_split(
    X_risk, y_risk, test_size=0.2, random_state=42
)

print("\n🎯 Training Risk Model (XGBoost)...")
risk_model = XGBClassifier(
    max_depth=4, learning_rate=0.05, n_estimators=100,
    reg_alpha=1.0, reg_lambda=1.0, subsample=0.8,
    colsample_bytree=0.8, random_state=42
)
risk_model.fit(X_risk_train, y_risk_train, eval_set=[(X_risk_test, y_risk_test)], verbose=0)

# Evaluate
y_risk_pred_train = risk_model.predict_proba(X_risk_train)[:, 1]
y_risk_pred_test = risk_model.predict_proba(X_risk_test)[:, 1]
train_auc = roc_auc_score(y_risk_train, y_risk_pred_train)
test_auc = roc_auc_score(y_risk_test, y_risk_pred_test)
cv_scores = cross_val_score(risk_model, X_risk_train, y_risk_train, cv=5, scoring='roc_auc')

print(f"\n✅ Risk Model Performance:")
print(f"  Train AUC: {train_auc:.4f}")
print(f"  Test AUC:  {test_auc:.4f}")
print(f"  CV AUC:    {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# Save
joblib.dump(risk_model, MODELS_DIR / 'risk_pipeline_v2.pkl')
joblib.dump(X_risk.columns.tolist(), MODELS_DIR / 'risk_features_v2.pkl')
print(f"✓ Risk model saved")

# ============================================================================
# 2. REVISION URGENCY MODEL TRAINING
# ============================================================================

print("\n📚 PHASE 2: Revision Urgency Model Training")
print("-" * 70)

# Generate revision dataset
n_students_rev = 2000
n_topics = 8
n_records = n_students_rev * n_topics

revision_data = pd.DataFrame({
    'mastery': np.random.beta(2, 3, n_records),
    'last_studied': np.random.exponential(5, n_records).astype(int).clip(0, 90),
    'attempts': np.random.poisson(3, n_records),
    'last_score': np.random.normal(65, 20, n_records).clip(0, 100),
    'practice_hours': np.random.exponential(2, n_records).clip(0, 20),
})

# Add zeros (7% missing)
missed_mask = np.random.random(n_records) < 0.07
revision_data.loc[missed_mask, 'attempts'] = 0
revision_data.loc[missed_mask, 'last_score'] = 0
revision_data.loc[missed_mask, 'practice_hours'] = 0

# Create target
needs_revision_prob = (
    ((revision_data['mastery'] < 0.5) & (revision_data['last_studied'] > 7)) |
    ((revision_data['mastery'] < 0.3)) |
    ((revision_data['attempts'] < 2) & (revision_data['mastery'] < 0.7))
)
revision_data['needs_revision'] = needs_revision_prob.astype(int)

# Add noise (8%)
noise_mask = np.random.random(n_records) < 0.08
revision_data.loc[noise_mask, 'needs_revision'] = 1 - revision_data.loc[noise_mask, 'needs_revision']

print(f"✓ Generated {n_records} topic records ({n_students_rev} students × {n_topics} topics)")
print(f"  Needs revision: {revision_data['needs_revision'].sum()} ({revision_data['needs_revision'].mean()*100:.1f}%)")

# Split and train
X_rev = revision_data.drop('needs_revision', axis=1)
y_rev = revision_data['needs_revision']
X_rev_train, X_rev_test, y_rev_train, y_rev_test = train_test_split(
    X_rev, y_rev, test_size=0.2, random_state=42
)

print("\n🎯 Training Revision Urgency Model (XGBoost)...")
revision_model = XGBClassifier(
    max_depth=3, learning_rate=0.05, n_estimators=80,
    reg_alpha=1.5, reg_lambda=1.5, subsample=0.7,
    colsample_bytree=0.7, random_state=42
)
revision_model.fit(X_rev_train, y_rev_train, eval_set=[(X_rev_test, y_rev_test)], verbose=0)

# Evaluate
y_rev_pred_train = revision_model.predict_proba(X_rev_train)[:, 1]
y_rev_pred_test = revision_model.predict_proba(X_rev_test)[:, 1]
train_auc_rev = roc_auc_score(y_rev_train, y_rev_pred_train)
test_auc_rev = roc_auc_score(y_rev_test, y_rev_pred_test)
cv_scores_rev = cross_val_score(revision_model, X_rev_train, y_rev_train, cv=5, scoring='roc_auc')

print(f"\n✅ Revision Model Performance:")
print(f"  Train AUC: {train_auc_rev:.4f}")
print(f"  Test AUC:  {test_auc_rev:.4f}")
print(f"  CV AUC:    {cv_scores_rev.mean():.4f} (+/- {cv_scores_rev.std():.4f})")

# Save
joblib.dump(revision_model, MODELS_DIR / 'revision_planner_model.pkl')
joblib.dump(X_rev.columns.tolist(), MODELS_DIR / 'revision_features.pkl')
print(f"✓ Revision model saved")

# ============================================================================
# 3. SAVE METADATA
# ============================================================================

print("\n💾 PHASE 3: Saving Metadata")
print("-" * 70)

metadata = {
    'risk_model': {
        'type': 'XGBClassifier',
        'features': X_risk.columns.tolist(),
        'train_auc': float(train_auc),
        'test_auc': float(test_auc),
        'cv_auc_mean': float(cv_scores.mean()),
        'cv_auc_std': float(cv_scores.std()),
        'version': '2.0'
    },
    'revision_model': {
        'type': 'XGBClassifier',
        'features': X_rev.columns.tolist(),
        'train_auc': float(train_auc_rev),
        'test_auc': float(test_auc_rev),
        'cv_auc_mean': float(cv_scores_rev.mean()),
        'cv_auc_std': float(cv_scores_rev.std()),
        'version': '2.0'
    }
}

joblib.dump(metadata, MODELS_DIR / 'model_metadata.pkl')
print(f"✓ Metadata saved")

print("\n" + "=" * 70)
print("✅ MODEL TRAINING COMPLETE!")
print("=" * 70)

print("\n📦 Generated Files:")
print(f"  • ml-service/models/risk_pipeline_v2.pkl")
print(f"  • ml-service/models/risk_features_v2.pkl")
print(f"  • ml-service/models/revision_planner_model.pkl")
print(f"  • ml-service/models/revision_features.pkl")
print(f"  • ml-service/models/model_metadata.pkl")

print("\n📊 Model Performance Summary:")
print(f"  Risk Model      - Test AUC: {test_auc:.4f}")
print(f"  Revision Model  - Test AUC: {test_auc_rev:.4f}")

print("\n🚀 Next Steps:")
print(f"  1. Commit to GitHub: git add . && git commit -m 'Add trained ML models'")
print(f"  2. Create Render service: Name 'smart-education-ml'")
print(f"  3. Start command: node ml-service/server.js")

print("\n" + "=" * 70 + "\n")
