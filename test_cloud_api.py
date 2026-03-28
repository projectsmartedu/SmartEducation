import requests
import json

BASE_URL = "https://smarteducation-mlmodel.onrender.com"

print("Testing Cloud ML API - After Python Runtime Setup")
print("=" * 70)

# Test Health
print("\n1. HEALTH CHECK")
try:
    r = requests.get(f"{BASE_URL}/api/health", timeout=15)
    print(f"Status: {r.status_code}")
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {str(e)}")

# Test Risk - Good Student
print("\n2. RISK PREDICTION (Good Student)")
try:
    r = requests.post(f"{BASE_URL}/api/risk/predict", json={
        "prior_failures": 0, "study_time": 5, "absences": 2, "parent_edu": 3,
        "family_support": 4, "health": 4, "internet": 1, "activities": 1,
        "travel_time": 1, "age": 18, "paid_support": 0
    }, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS!")
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Error: {r.text[:300]}")
except Exception as e:
    print(f"Error: {str(e)}")

# Test Risk - At-Risk Student
print("\n3. RISK PREDICTION (At-Risk Student)")
try:
    r = requests.post(f"{BASE_URL}/api/risk/predict", json={
        "prior_failures": 3, "study_time": 1, "absences": 15, "parent_edu": 1,
        "family_support": 1, "health": 2, "internet": 0, "activities": 0,
        "travel_time": 3, "age": 22, "paid_support": 0
    }, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS!")
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Error: {r.text[:300]}")
except Exception as e:
    print(f"Error: {str(e)}")

# Test Revision Mindmap
print("\n4. REVISION MINDMAP GENERATION")
try:
    r = requests.post(f"{BASE_URL}/api/revision/mindmap", json={
        "studentId": "student-001",
        "topicProgress": [
            {"name": "Mathematics", "mastery": 0.75, "days_since_studied": 3, "attempts": 5, "last_score": 82, "practice_hours": 10},
            {"name": "Physics", "mastery": 0.45, "days_since_studied": 12, "attempts": 2, "last_score": 58, "practice_hours": 3},
            {"name": "Chemistry", "mastery": 0.60, "days_since_studied": 7, "attempts": 3, "last_score": 75, "practice_hours": 5}
        ]
    }, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS!")
        result = r.json()
        print(f"Generated {len(result.get('nodes', []))} topics with urgency scores")
        print(json.dumps(result, indent=2))
    else:
        print(f"Error: {r.text[:300]}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
