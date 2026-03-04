#!/usr/bin/env python3
"""
Test ML Models Locally
Run: python ml-service/scripts/test_model.py
"""

import joblib
import pandas as pd
import json
from pathlib import Path

MODELS_DIR = Path(__file__).parent.parent / 'models'

print("\n" + "="*70)
print("TESTING ML MODELS")
print("="*70)

# Load models
print("\nLoading models...")
risk_model = joblib.load(MODELS_DIR / 'risk_pipeline_v2.pkl')
risk_features = joblib.load(MODELS_DIR / 'risk_features_v2.pkl')
revision_model = joblib.load(MODELS_DIR / 'revision_planner_model.pkl')
revision_features = joblib.load(MODELS_DIR / 'revision_features.pkl')
metadata = joblib.load(MODELS_DIR / 'model_metadata.pkl')

print("Models loaded successfully!")

# TEST 1: At-Risk Student
print("\n" + "-"*70)
print("TEST 1: At-Risk Student")
print("-"*70)

student_at_risk = pd.DataFrame({
    'prior_failures': [3],
    'study_time': [2],
    'absences': [15],
    'parent_edu': [2],
    'family_support': [1],
    'health': [3],
    'internet': [0],
    'activities': [0],
    'travel_time': [3],
    'age': [18],
    'paid_support': [0]
})

pred_at_risk = risk_model.predict_proba(student_at_risk)[0]
risk_score = pred_at_risk[1]

print(f"Risk Score: {risk_score:.4f}")
if risk_score > 0.66:
    print(f"Status: HIGH RISK")
elif risk_score > 0.33:
    print(f"Status: MEDIUM RISK")
else:
    print(f"Status: LOW RISK")

# TEST 2: Topic Urgency
print("\n" + "-"*70)
print("TEST 2: Topic Urgency (Needs Revision)")
print("-"*70)

topic_urgent = pd.DataFrame({
    'mastery': [0.35],
    'last_studied': [21],
    'attempts': [1],
    'last_score': [45],
    'practice_hours': [0.5]
})

pred_rev_urgent = revision_model.predict_proba(topic_urgent)[0]
urgency_score = pred_rev_urgent[1]

print(f"Urgency Score: {urgency_score:.4f}")
if urgency_score > 0.66:
    print(f"Status: URGENT REVISION")
elif urgency_score > 0.33:
    print(f"Status: MODERATE REVISION")
else:
    print(f"Status: NO URGENT REVISION")

# TEST 3: Batch Prediction
print("\n" + "-"*70)
print("TEST 3: Batch Prediction (5 Students)")
print("-"*70)

students_batch = pd.DataFrame({
    'prior_failures': [0, 2, 1, 3, 0],
    'study_time': [6, 3, 5, 1, 8],
    'absences': [3, 12, 8, 20, 1],
    'parent_edu': [4, 2, 3, 1, 4],
    'family_support': [4, 2, 3, 1, 4],
    'health': [5, 3, 4, 2, 5],
    'internet': [1, 0, 1, 0, 1],
    'activities': [1, 0, 1, 0, 1],
    'travel_time': [1, 2, 2, 4, 1],
    'age': [17, 19, 18, 20, 16],
    'paid_support': [1, 0, 1, 0, 1]
})

batch_preds = risk_model.predict_proba(students_batch)[:, 1]

print(f"\n{'ID':<6} {'Risk Score':<15} {'Category':<15}")
print("-" * 40)
for i, score in enumerate(batch_preds):
    if score > 0.66:
        category = "HIGH"
    elif score > 0.33:
        category = "MEDIUM"
    else:
        category = "LOW"
    print(f"STU-{i+1:<2d} {score:<15.4f} {category:<15}")

print("\n" + "="*70)
print("TEST COMPLETE!")
print("="*70)
print(f"\nRisk Model Test AUC: {metadata['risk_model']['test_auc']:.4f}")
print(f"Revision Model Test AUC: {metadata['revision_model']['test_auc']:.4f}")
