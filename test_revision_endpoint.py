#!/usr/bin/env python3
import requests
import json

revision_data = {
    'studentId': 'test-student-001',
    'topicProgress': [
        {
            'name': 'Linear Algebra',
            'mastery': 0.4,
            'days_since_studied': 10,
            'attempts': 3,
            'last_score': 65,
            'practice_hours': 5
        },
        {
            'name': 'Calculus',
            'mastery': 0.6,
            'days_since_studied': 5,
            'attempts': 5,
            'last_score': 78,
            'practice_hours': 8
        },
        {
            'name': 'Statistics',
            'mastery': 0.3,
            'days_since_studied': 20,
            'attempts': 2,
            'last_score': 45,
            'practice_hours': 2
        }
    ]
}

print("Testing Revision Mindmap Endpoint...\n")
r = requests.post('https://smarteducation-mlmodel.onrender.com/api/revision/mindmap', 
                  json=revision_data, timeout=30)
print(f'Status: {r.status_code}')

if r.status_code == 200:
    resp = r.json()
    print('\n✅ SUCCESS!')
    print(f'Student ID: {resp.get("studentId")}')
    print(f'Nodes: {len(resp.get("nodes", []))}')
    print(f'Edges: {len(resp.get("edges", []))}')
    print(f'\nFirst node: {json.dumps(resp.get("nodes", [])[0], indent=2) if resp.get("nodes") else "No nodes"}')
else:
    print(f'\nError: {r.text}')
