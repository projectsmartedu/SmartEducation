/**
 * MODERN MIND MAP INTEGRATION GUIDE
 * 
 * This file shows how to integrate the ModernMindMap component
 * with live ML predictions and real-time data
 */

import React, { useState, useEffect } from 'react';
import ModernMindMap from './ModernMindMap';

// Example: Integration with your backend
const MindMapIntegration = () => {
    const [topicProgress, setTopicProgress] = useState([]);
    const [mlPredictions, setMlPredictions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        fetchMindMapData();

        // Optional: Poll for live updates every 30 seconds
        const interval = setInterval(fetchMindMapData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchMindMapData = async () => {
        try {
            setLoading(true);

            // Fetch topic progress
            const progressRes = await fetch('/api/progress', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const progressData = await progressRes.json();
            setTopicProgress(progressData.topics || []);

            // Fetch ML predictions (from your ML service)
            const studentId = localStorage.getItem('studentId');
            const predictionsRes = await fetch(`/api/ml/predictions/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const predictionsData = await predictionsRes.json();

            // Transform predictions to topic-based object
            const predictions = {};
            predictionsData.forEach(pred => {
                predictions[pred.topicId] = {
                    urgencyScore: pred.urgencyScore,
                    riskCategory: pred.riskCategory,
                    recommendation: pred.recommendation,
                };
            });
            setMlPredictions(predictions);

            setError(null);
        } catch (err) {
            console.error('Error fetching mind map data:', err);
            setError('Failed to load revision plan');
        } finally {
            setLoading(false);
        }
    };

    const handleTopicClick = (topic) => {
        console.log('Topic selected:', topic);
        // Navigate to topic detail or start learning
        // window.location.href = `/learn/${topic.id}`;
    };

    if (loading) {
        return <div className="loading-state">Loading your revision plan...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <ModernMindMap
            studentData={{ id: localStorage.getItem('studentId') }}
            topicProgress={topicProgress}
            mlPredictions={mlPredictions}
            onTopicClick={handleTopicClick}
        />
    );
};

export default MindMapIntegration;

/**
 * EXAMPLE: How to structure your topic progress data from API
 * 
 * Each topic should have:
 * {
 *   id: "topic_123",
 *   name: "Calculus — Derivatives",
 *   masteryPercentage: 45,
 *   videosWatched: 5,
 *   quizzesTaken: 3,
 *   revisionCount: 2,
 *   lastUpdated: "2024-03-04T10:30:00Z"
 * }
 */

/**
 * EXAMPLE: How to structure ML predictions data from your ML service
 * 
 * Each prediction should have:
 * {
 *   topicId: "topic_123",
 *   urgencyScore: 0.82,           // 0-1, higher = more urgent
 *   riskCategory: "HIGH",          // HIGH, MEDIUM, LOW
 *   recommendation: "Focus on derivatives before moving to integrals"
 * }
 */

/**
 * API ENDPOINTS YOU NEED
 * 
 * 1. GET /api/progress
 *    Returns: { topics: [] } - all topic progress
 * 
 * 2. POST /api/ml/predictions
 *    Body: { studentId, topics: [...] }
 *    Returns: { predictions: [] } - ML recommendations
 * 
 * 3. GET /api/ml/recommendations/:topicId
 *    Returns personalized recommendations for a topic
 */
