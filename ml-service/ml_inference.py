#!/usr/bin/env python3
"""
ML Inference Engine
Loads trained XGBoost models and makes predictions
"""

import sys
import json
import joblib
import os
from pathlib import Path

# Get the models directory
MODELS_DIR = Path(__file__).parent / 'models'

def load_models():
    """Load all trained models"""
    try:
        risk_model = joblib.load(MODELS_DIR / 'risk_pipeline_v2.pkl')
        risk_features = joblib.load(MODELS_DIR / 'risk_features_v2.pkl')
        revision_model = joblib.load(MODELS_DIR / 'revision_planner_model.pkl')
        revision_features = joblib.load(MODELS_DIR / 'revision_features.pkl')
        metadata = joblib.load(MODELS_DIR / 'model_metadata.pkl')
        return risk_model, risk_features, revision_model, revision_features, metadata
    except FileNotFoundError as e:
        print(json.dumps({'error': f'Model file not found: {e}'}))
        sys.exit(1)

def predict_risk(student_data):
    """Predict risk for a single student"""
    risk_model, risk_features, _, _, _ = load_models()
    
    try:
        import pandas as pd
        
        # Create DataFrame with correct column order
        df = pd.DataFrame([student_data])
        df = df[risk_features]  # Ensure correct column order
        
        # Get prediction
        pred_proba = risk_model.predict_proba(df)[0]
        risk_score = pred_proba[1]
        
        # Determine category
        if risk_score > 0.66:
            category = 'HIGH'
            intervention = 'Intensive intervention required. Schedule immediate meeting with student.'
        elif risk_score > 0.33:
            category = 'MEDIUM'
            intervention = 'Regular monitoring and support. Weekly check-ins recommended.'
        else:
            category = 'LOW'
            intervention = 'Continue standard support and monitoring.'
        
        return {
            'riskScore': float(risk_score),
            'category': category,
            'intervention': intervention,
            'confidence': float(max(pred_proba) * 100) / 100
        }
    except Exception as e:
        return {'error': str(e)}

def batch_predict_risk(students):
    """Batch predict risk for multiple students"""
    predictions = []
    for student in students:
        pred = predict_risk(student)
        predictions.append(pred)
    return predictions

def predict_topic_urgency(topic_data):
    """Predict revision urgency for a topic"""
    _, _, revision_model, revision_features, _ = load_models()
    
    try:
        import pandas as pd
        
        # Create DataFrame
        df = pd.DataFrame([topic_data])
        df = df[revision_features]
        
        # Get prediction
        pred_proba = revision_model.predict_proba(df)[0]
        urgency_score = pred_proba[1]
        
        # Determine category
        if urgency_score > 0.66:
            urgency = 'URGENT'
            recommendation = 'Start revision immediately. This topic needs attention.'
        elif urgency_score > 0.33:
            urgency = 'MODERATE'
            recommendation = 'Schedule revision soon. Include in study plan this week.'
        else:
            urgency = 'LOW'
            recommendation = 'Continue current pace. Maintain mastery level.'
        
        return {
            'urgencyScore': float(urgency_score),
            'urgency': urgency,
            'recommendation': recommendation,
            'confidence': float(max(pred_proba) * 100) / 100
        }
    except Exception as e:
        return {'error': str(e)}

def generate_mindmap(student_data, topic_progress):
    """Generate revision mind map"""
    try:
        import pandas as pd
        
        # Generate nodes for each topic
        nodes = []
        edges = []
        
        for i, topic in enumerate(topic_progress):
            topic_id = f'topic_{i+1}'
            
            # Get urgency for this topic
            urgency_pred = predict_topic_urgency({
                'mastery': topic.get('mastery', 0.5),
                'last_studied': topic.get('days_since_studied', 7),
                'attempts': topic.get('attempts', 0),
                'last_score': topic.get('last_score', 0),
                'practice_hours': topic.get('practice_hours', 0)
            })
            
            urgency_score = urgency_pred.get('urgencyScore', 0.5)
            
            # Determine color based on urgency
            if urgency_score > 0.66:
                color = '#ff6b6b'  # Red
            elif urgency_score > 0.33:
                color = '#ffd43b'  # Yellow
            else:
                color = '#51cf66'  # Green
            
            # Create node
            node = {
                'id': topic_id,
                'label': topic.get('name', f'Topic {i+1}'),
                'mastery': round(topic.get('mastery', 0.5) * 100),
                'revisionUrgency': round(urgency_score * 100),
                'color': color
            }
            nodes.append(node)
            
            # Create edges (sequential)
            if i > 0:
                edges.append({
                    'from': f'topic_{i}',
                    'to': topic_id
                })
        
        return {
            'studentId': student_data.get('studentId', 'unknown'),
            'nodes': nodes,
            'edges': edges,
            'generatedAt': pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        return {'error': str(e)}

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Task type required'}))
        sys.exit(1)
    
    task = sys.argv[1]
    
    if task == 'risk' and len(sys.argv) > 2:
        student_data = json.loads(sys.argv[2])
        result = predict_risk(student_data)
    
    elif task == 'batch_risk' and len(sys.argv) > 2:
        students = json.loads(sys.argv[2])
        result = batch_predict_risk(students)
    
    elif task == 'topic_urgency' and len(sys.argv) > 2:
        topic_data = json.loads(sys.argv[2])
        result = predict_topic_urgency(topic_data)
    
    elif task == 'mindmap' and len(sys.argv) > 2:
        data = json.loads(sys.argv[2])
        result = generate_mindmap(data, data.get('topicProgress', []))
    
    else:
        result = {'error': f'Unknown task: {task}'}
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == '__main__':
    main()
