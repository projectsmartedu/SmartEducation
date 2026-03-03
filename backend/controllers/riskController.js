const path = require('path');
const joblib = require('joblib');
const StudentProgress = require('../models/StudentProgress');

// Load model artifacts
const pipelinePath = path.join(__dirname, '../../risk_pipeline_v2.pkl');
const thresholdPath = path.join(__dirname, '../../risk_threshold_v2.pkl');
const featuresPath = path.join(__dirname, '../../risk_features_v2.pkl');

let pipeline, threshold, features;
try {
    pipeline = joblib.load(pipelinePath);
    threshold = joblib.load(thresholdPath);
    features = joblib.load(featuresPath);
} catch (err) {
    console.error('Error loading model artifacts:', err);
}

// Predict risk for a student
exports.predictRisk = async (req, res) => {
    try {
        const studentData = req.body; // Should match feature names
        const X = features.map(f => studentData[f]);
        const prob = pipeline.predict_proba([X])[0][1];
        const risk = prob >= threshold ? 'at-risk' : 'safe';
        res.json({ probability: prob, risk });
    } catch (err) {
        res.status(500).json({ error: 'Prediction failed', details: err.message });
    }
};
