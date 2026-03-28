import React, { useState, useEffect } from 'react';
import ModernMindMap from '../components/ModernMindMap';

/**
 * Student Revision Dashboard - Modern UI
 * 
 * Features:
 * - Live ML predictions integration
 * - Priority-based visual layout
 * - Real-time data updates
 * - Professional, modern design
 * 
 * This page demonstrates the complete ML pipeline:
 * 1. Loads student progress data
 * 2. Fetches ML predictions (urgency scores, recommendations)
 * 3. Displays beautiful, modern mind map with urgency indicators
 * 4. Real-time updates every 30 seconds
 */
const StudentRevisionDashboard = ({ studentId = 'student-001' }) => {
    const [studentData, setStudentData] = useState(null);
    const [topicProgress, setTopicProgress] = useState([]);
    const [mlPredictions, setMlPredictions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Helper: Calculate urgency score (ML service does this in production)
    const calculateUrgencyScore = React.useCallback((topic) => {
        const masteryFactor = (1 - (topic.masteryPercentage || 0) / 100) * 0.6;
        const staleFactor = Math.min((topic.daysSinceReview || 0) / 30, 1) * 0.4;
        return Math.min(masteryFactor + staleFactor, 1);
    }, []);

    // Helper: Get AI recommendation
    const getRecommendation = React.useCallback((topic) => {
        const urgency = calculateUrgencyScore(topic);
        if (urgency > 0.66) {
<<<<<<< Updated upstream
            return `Start revision immediately. ${topic.name} hasn't been studied in ${topic.last_studied} days and mastery is only ${Math.round(topic.mastery * 100)}%.`;
        } else if (urgency > 0.33) {
            return `Schedule revision soon. Review ${topic.name} this week to maintain skills.`;
        } else {
            return `Continue current pace. ${topic.name} is well-maintained at ${Math.round(topic.mastery * 100)}% mastery.`;
        }
    }, [calculateUrgencyScore]);

    // Handle topic update from mind map
    const handleTopicUpdate = (updatedTopic) => {
        console.log('Topic updated:', updatedTopic);
    };
=======
            return `Start revision immediately. This topic needs urgent focus to prevent knowledge decay.`;
        } else if (urgency > 0.33) {
            return `Schedule regular revision this week. Maintain your current understanding.`;
        } else {
            return `Well-maintained topic. Continue with your current learning pace.`;
        }
    }, [calculateUrgencyScore]);

    // Fetch data from API
    const fetchMindMapData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
>>>>>>> Stashed changes

            // In production, fetch from your API:
            // const progressRes = await fetch(`/api/progress/${studentId}`);
            // const topicsData = await progressRes.json();

            // For now, use mock data
            const mockStudentData = {
                id: studentId,
                name: 'Harsh Sharma',
                email: 'harsh@example.com',
            };

            const mockTopicProgress = [
                {
                    id: 'calc-deriv',
                    name: 'Calculus — Derivatives',
                    masteryPercentage: 75,
                    daysSinceReview: 3,
                    quizzesTaken: 5,
                    videosWatched: 8,
                    revisionCount: 2,
                    lastScore: 82,
                },
                {
                    id: 'calc-integ',
                    name: 'Calculus — Integration',
                    masteryPercentage: 45,
                    daysSinceReview: 12,
                    quizzesTaken: 2,
                    videosWatched: 3,
                    revisionCount: 0,
                    lastScore: 58,
                },
                {
                    id: 'atomic-struct',
                    name: 'Atomic Structure',
                    masteryPercentage: 62,
                    daysSinceReview: 7,
                    quizzesTaken: 4,
                    videosWatched: 6,
                    revisionCount: 1,
                    lastScore: 70,
                },
                {
                    id: 'motion-line',
                    name: 'Motion in a Straight Line',
                    masteryPercentage: 88,
                    daysSinceReview: 1,
                    quizzesTaken: 6,
                    videosWatched: 9,
                    revisionCount: 3,
                    lastScore: 94,
                },
                {
                    id: 'units-measure',
                    name: 'Units & Measurements',
                    masteryPercentage: 85,
                    daysSinceReview: 2,
                    quizzesTaken: 5,
                    videosWatched: 7,
                    revisionCount: 2,
                    lastScore: 91,
                },
            ];

            setStudentData(mockStudentData);
            setTopicProgress(mockTopicProgress);

            // Build ML predictions object
            const predictions = {};
            mockTopicProgress.forEach((topic) => {
                const urgencyScore = calculateUrgencyScore(topic);
                predictions[topic.id] = {
                    urgencyScore,
                    riskCategory: urgencyScore > 0.66 ? 'HIGH' : urgencyScore > 0.33 ? 'MEDIUM' : 'LOW',
                    recommendation: getRecommendation(topic),
                };
            });

<<<<<<< Updated upstream
                setPredictions(revisionPredictions);
                console.log('Revision predictions:', revisionPredictions);
                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err.message);
                setLoading(false);
            }
        };
=======
            setMlPredictions(predictions);
            setLastUpdate(new Date());
>>>>>>> Stashed changes

            console.log('✅ Mind map data loaded:', {
                topics: mockTopicProgress.length,
                predictions: Object.keys(predictions).length,
            });

        } catch (err) {
            console.error('❌ Error loading mind map data:', err);
            setError(err.message || 'Failed to load revision plan');
        } finally {
            setLoading(false);
        }
    }, [studentId, calculateUrgencyScore, getRecommendation]);

    // Load data on mount and set up polling
    useEffect(() => {
        fetchMindMapData();

        // Optional: Update data every 30 seconds for live updates
        const interval = setInterval(fetchMindMapData, 30000);
        return () => clearInterval(interval);
    }, [fetchMindMapData]);

    // Handle topic selection
    const handleTopicClick = (topic) => {
        console.log('📚 Topic selected:', topic);
        // Navigate to topic learning or open modal
        // window.location.href = `/learn/${topic.id}`;
    };

    const LoadingState = () => (
        <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '16px',
        }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📚</div>
            Loading your revision plan...
        </div>
    );

    const ErrorState = () => (
        <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            margin: '20px',
        }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontWeight: '600' }}>Error Loading Data</div>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{error}</p>
        </div>
    );

    return (
        <div style={{ padding: '16px' }}>
            {loading && <LoadingState />}
            {error && <ErrorState />}
            {!loading && !error && (
                <>
                    <ModernMindMap
                        studentData={studentData}
                        topicProgress={topicProgress}
                        mlPredictions={mlPredictions}
                        onTopicClick={handleTopicClick}
                    />
                    {lastUpdate && (
                        <div style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '12px',
                        }}>
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentRevisionDashboard;
