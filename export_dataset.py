#!/usr/bin/env python3
"""
Export Synthetic Student Dataset to CSV
Generates 10,000 student records with risk prediction features
Run: python export_dataset.py
Output: dataset.csv and dataset.json
"""

import numpy as np
import pandas as pd
from pathlib import Path

print("=" * 70)
print("GENERATING STUDENT DATASET - 10,000 RECORDS")
print("=" * 70)

# Set random seed for reproducibility
np.random.seed(42)

# Generate realistic risk dataset (10,000 students)
n_students = 10000
print(f"\nGenerating {n_students} student records...")

dataset = pd.DataFrame({
    'student_id': range(1, n_students + 1),
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

# Create risk target based on multiple factors
at_risk_prob = (
    (dataset['prior_failures'] > 0) |
    (dataset['family_support'] < 2) |
    (dataset['absences'] > 10) |
    ((dataset['study_time'] < 2) & (dataset['parent_edu'] < 3))
)
dataset['at_risk'] = at_risk_prob.astype(int)

# Add realistic noise (10% flip)
noise_mask = np.random.random(n_students) < 0.10
dataset.loc[noise_mask, 'at_risk'] = 1 - dataset.loc[noise_mask, 'at_risk']

# Add additional useful columns
dataset['gpa_estimate'] = (4.0 - (dataset['prior_failures'] * 0.3) - (dataset['absences'] * 0.01) + np.random.normal(0, 0.3, n_students)).clip(0, 4.0)
dataset['engagement_score'] = (dataset['study_time'] + dataset['activities'] * 2 + dataset['family_support']) / 5.0
dataset['risk_score'] = np.where(
    dataset['at_risk'] == 1,
    np.random.uniform(0.5, 1.0, n_students),
    np.random.uniform(0.0, 0.5, n_students)
)

# Print statistics
print(f"\n📊 Dataset Statistics:")
print(f"  Total records: {len(dataset)}")
print(f"  At-risk students: {dataset['at_risk'].sum()} ({dataset['at_risk'].mean()*100:.1f}%)")
print(f"  Good standing: {(1-dataset['at_risk']).sum()} ({(1-dataset['at_risk']).mean()*100:.1f}%)")
print(f"\n  Average GPA: {dataset['gpa_estimate'].mean():.2f}")
print(f"  Average Study Time: {dataset['study_time'].mean():.1f} hours/week")
print(f"  Average Absences: {dataset['absences'].mean():.1f}")
print(f"  Average Age: {dataset['age'].mean():.1f} years")

# Export to CSV
csv_path = Path('dataset.csv')
dataset.to_csv(csv_path, index=False)
print(f"\n✅ CSV exported: {csv_path.absolute()}")
print(f"   Columns: {', '.join(dataset.columns.tolist())}")

# Export to JSON
json_path = Path('dataset.json')
dataset.to_json(json_path, orient='records', indent=2)
print(f"✅ JSON exported: {json_path.absolute()}")

# Show sample records
print(f"\n📋 Sample Records (First 5):")
print("=" * 70)
print(dataset.head(10).to_string(index=False))

print(f"\n" + "=" * 70)
print(f"✨ Dataset ready for analysis!")
print(f"=" * 70)
