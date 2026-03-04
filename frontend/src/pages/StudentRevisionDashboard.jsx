import React, { useState, useEffect } from 'react';
import RevisionMindMap from '../components/RevisionMindMap';

/**
 * Student Revision Dashboard
 * 
 * This page demonstrates the complete ML pipeline:
 * 1. Loads student progress data
 * 2. Displays beautiful mind map with urgency indicators
 * 3. Allows editing and study plan generation
 */
const StudentRevisionDashboard = ({ studentId }) => {
    const [student, setStudent] = useState(null);
    const [topicProgress, setTopicProgress] = useState([]);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper: Calculate urgency score (simplified - ML service does this)
    const calculateUrgencyScore = React.useCallback((topic) => {
        const masteryFactor = (1 - topic.mastery) * 0.6;
        const staleFactor = Math.min(topic.last_studied / 30, 1) * 0.4;
        return Math.min(masteryFactor + staleFactor, 1);
    }, []);

    // Helper: Get recommendation text
    const getRecommendation = React.useCallback((topic) => {
        const urgency = calculateUrgencyScore(topic);
        if (urgency > 0.66) {
            return `🚨 Start revision immediately. ${topic.name} hasn't been studied in ${topic.last_studied} days and mastery is only ${Math.round(topic.mastery * 100)}%.`;
        } else if (urgency > 0.33) {
            return `⚠️ Schedule revision soon. Review ${topic.name} this week to maintain skills.`;
        } else {
            return `✅ Continue current pace. ${topic.name} is well-maintained at ${Math.round(topic.mastery * 100)}% mastery.`;
        }
    }, [calculateUrgencyScore]);

    // Handle topic update from mind map
    const handleTopicUpdate = (updatedTopic) => {
        console.log('📝 Topic updated:', updatedTopic);
    };

    // Load data and predictions on component mount
    useEffect(() => {
        const mockStudentData = {
            id: 'student-001',
            name: 'Harsh Sharma',
            prior_failures: 1,
            study_time: 3,
            absences: 5,
            parent_edu: 3,
            family_support: 1,
            health: 4,
            internet: 1,
            activities: 1,
            travel_time: 2,
            age: 18,
            paid_support: 0,
        };

        const mockTopicProgress = [
            {
                name: 'Calculus - Derivatives',
                mastery: 0.75,
                last_studied: 3,
                attempts: 5,
                last_score: 82,
                practice_hours: 8,
            },
            {
                name: 'Calculus - Integration',
                mastery: 0.45,
                last_studied: 12,
                attempts: 2,
                last_score: 58,
                practice_hours: 2,
            },
            {
                name: 'Linear Algebra',
                mastery: 0.62,
                last_studied: 7,
                attempts: 4,
                last_score: 70,
                practice_hours: 5,
            },
        ];

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                setStudent(mockStudentData);
                setTopicProgress(mockTopicProgress);

                const revisionPredictions = mockTopicProgress.map((topic) => ({
                    topicName: topic.name,
                    urgencyScore: calculateUrgencyScore(topic),
                    urgency:
                        calculateUrgencyScore(topic) > 0.66
                            ? 'URGENT'
                            : calculateUrgencyScore(topic) > 0.33
                                ? 'MODERATE'
                                : 'LOW',
                    recommendation: getRecommendation(topic),
                }));

                setPredictions(revisionPredictions);
                console.log('✅ Revision predictions:', revisionPredictions);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error loading data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, [studentId, calculateUrgencyScore, getRecommendation]);

    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            {!loading && !error && predictions && (
                <RevisionMindMap
                    studentData={student}
                    topicProgress={topicProgress}
                    mlPredictions={predictions}
                    onUpdate={handleTopicUpdate}
                />
            )}
        </div>
    );
};

export default StudentRevisionDashboard;
