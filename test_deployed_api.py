#!/usr/bin/env python3
"""Test the deployed ML API on Render"""

import requests
import json

base_url = 'https://smarteducation-mlmodel.onrender.com'

print("\n" + "="*60)
print("TESTING DEPLOYED ML SERVICE ON RENDER")
print("="*60 + "\n")

# Test 1: Health Check
print("1️⃣  HEALTH CHECK")
try:
    r = requests.get(f'{base_url}/api/health', timeout=15)
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 2: Risk Prediction (Good Student)
print("2️⃣  RISK PREDICTION (Good Student)")
student_data = {
    "prior_failures": 0,
    "study_time": 5,
    "absences": 2,
    "parent_edu": 3,
    "family_support": 4,
    "health": 4,
    "internet": 1,
    "activities": 1,
    "travel_time": 1,
    "age": 18,
    "paid_support": 0
}
try:
    r = requests.post(f'{base_url}/api/risk/predict', json=student_data, timeout=30)
    print(f"   Status: {r.status_code}")
    resp = r.json()
    print(f"   Risk Score: {resp.get('riskScore', 'N/A')}")
    print(f"   Category: {resp.get('category', 'N/A')}")
    print(f"   Intervention: {resp.get('intervention', 'N/A')[:80]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 3: Risk Prediction (At-Risk Student)
print("3️⃣  RISK PREDICTION (At-Risk Student)")
at_risk_data = {
    "prior_failures": 3,
    "study_time": 1,
    "absences": 10,
    "parent_edu": 1,
    "family_support": 1,
    "health": 2,
    "internet": 0,
    "activities": 0,
    "travel_time": 3,
    "age": 20,
    "paid_support": 0
}
try:
    r = requests.post(f'{base_url}/api/risk/predict', json=at_risk_data, timeout=30)
    print(f"   Status: {r.status_code}")
    resp = r.json()
    print(f"   Risk Score: {resp.get('riskScore', 'N/A')}")
    print(f"   Category: {resp.get('category', 'N/A')}")
    print(f"   Intervention: {resp.get('intervention', 'N/A')[:80]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 4: Revision Mindmap
print("4️⃣  REVISION MINDMAP")
revision_data = {
    "topics": ["Linear Algebra", "Calculus", "Statistics"],
    "mastery": [0.4, 0.6, 0.3],
    "last_studied": [10, 5, 20],
    "attempts": [3, 5, 2]
}
try:
    r = requests.post(f'{base_url}/api/revision/mindmap', json=revision_data, timeout=30)
    print(f"   Status: {r.status_code}")
    resp = r.json()
    print(f"   Has nodes: {'nodes' in resp}")
    print(f"   Has edges: {'edges' in resp}")
    if 'nodes' in resp:
        print(f"   Number of nodes: {len(resp.get('nodes', []))}")
    if 'edges' in resp:
        print(f"   Number of edges: {len(resp.get('edges', []))}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("✅ API TEST COMPLETE")
print("="*60 + "\n")
