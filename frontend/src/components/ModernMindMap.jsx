import React, { useState, useMemo } from 'react';
import './ModernMindMap.css';

/**
 * Modern Mind Map Component - Professional & Interactive
 * Features:
 *   - Live ML predictions integration
 *   - Priority-based visual layout (Urgent, Moderate, Low)
 *   - Smooth animations and transitions
 *   - Real-time data updates
 *   - Interactive topic cards
 *   - Progress tracking
 *   - Responsive design
 */

const ModernMindMap = ({
    studentData,
    topicProgress = [],
    mlPredictions = {},
    onTopicClick = () => { }
}) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [filterLevel, setFilterLevel] = useState('all');

    // Categorize topics by urgency from ML predictions
    const categorizedTopics = useMemo(() => {
        const urgent = [];
        const moderate = [];
        const low = [];

        topicProgress.forEach((topic) => {
            const mlData = mlPredictions[topic.id] || {};
            const urgencyScore = mlData.urgencyScore ?? 0;
            const masteryLevel = topic.masteryPercentage || 0;

            const topicData = {
                id: topic.id,
                title: topic.name,
                masteryLevel,
                urgencyScore,
                riskCategory: mlData.riskCategory || 'MEDIUM',
                recommendation: mlData.recommendation || 'Continue learning',
                videosWatched: topic.videosWatched || 0,
                quizzesTaken: topic.quizzesTaken || 0,
                revisionCount: topic.revisionCount || 0,
            };

            if (urgencyScore > 0.66) {
                urgent.push(topicData);
            } else if (urgencyScore > 0.33) {
                moderate.push(topicData);
            } else {
                low.push(topicData);
            }
        });

        return { urgent, moderate, low };
    }, [topicProgress, mlPredictions]);

    // Get filtered view
    const getDisplayTopics = () => {
        if (filterLevel === 'urgent') return categorizedTopics.urgent;
        if (filterLevel === 'moderate') return categorizedTopics.moderate;
        if (filterLevel === 'low') return categorizedTopics.low;
        return [...categorizedTopics.urgent, ...categorizedTopics.moderate, ...categorizedTopics.low];
    };

    // Summary stats
    const stats = {
        total: topicProgress.length,
        urgent: categorizedTopics.urgent.length,
        moderate: categorizedTopics.moderate.length,
        low: categorizedTopics.low.length,
        avgMastery: topicProgress.length > 0
            ? Math.round(topicProgress.reduce((sum, t) => sum + (t.masteryPercentage || 0), 0) / topicProgress.length)
            : 0,
    };

    return (
        <div className="modern-mind-map-container">
            {/* Header Section */}
            <div className="mmap-header">
                <div className="mmap-header-content">
                    <div className="mmap-title-section">
                        <h1 className="mmap-title">📚 Revision Study Plan</h1>
                        <p className="mmap-subtitle">AI-powered personalized learning recommendations</p>
                    </div>
                    <div className="mmap-stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Topics</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.avgMastery}%</div>
                            <div className="stat-label">Avg Mastery</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="mmap-controls">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filterLevel === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterLevel('all')}
                    >
                        All Topics ({stats.total})
                    </button>
                    <button
                        className={`filter-btn urgent-btn ${filterLevel === 'urgent' ? 'active' : ''}`}
                        onClick={() => setFilterLevel('urgent')}
                    >
                        🚨 Urgent ({stats.urgent})
                    </button>
                    <button
                        className={`filter-btn moderate-btn ${filterLevel === 'moderate' ? 'active' : ''}`}
                        onClick={() => setFilterLevel('moderate')}
                    >
                        ⚠️ Moderate ({stats.moderate})
                    </button>
                    <button
                        className={`filter-btn low-btn ${filterLevel === 'low' ? 'active' : ''}`}
                        onClick={() => setFilterLevel('low')}
                    >
                        ✅ Low ({stats.low})
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mmap-content">
                {/* Priority Sections */}
                <div className="priority-sections">
                    {/* Urgent Topics */}
                    {categorizedTopics.urgent.length > 0 && (
                        <div className="priority-section urgent-section">
                            <div className="section-header">
                                <div className="section-icon">🚨</div>
                                <div className="section-info">
                                    <h2 className="section-title">Urgent</h2>
                                    <p className="section-desc">Needs immediate focus</p>
                                </div>
                                <div className="section-badge">{categorizedTopics.urgent.length}</div>
                            </div>
                            <div className="topics-grid">
                                {categorizedTopics.urgent.map((topic) => (
                                    <TopicCard
                                        key={topic.id}
                                        topic={topic}
                                        isSelected={selectedTopic?.id === topic.id}
                                        onSelect={() => {
                                            setSelectedTopic(topic);
                                            onTopicClick(topic);
                                        }}
                                        priority="urgent"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Moderate Topics */}
                    {categorizedTopics.moderate.length > 0 && (
                        <div className="priority-section moderate-section">
                            <div className="section-header">
                                <div className="section-icon">⚠️</div>
                                <div className="section-info">
                                    <h2 className="section-title">Moderate</h2>
                                    <p className="section-desc">Regular attention needed</p>
                                </div>
                                <div className="section-badge">{categorizedTopics.moderate.length}</div>
                            </div>
                            <div className="topics-grid">
                                {categorizedTopics.moderate.map((topic) => (
                                    <TopicCard
                                        key={topic.id}
                                        topic={topic}
                                        isSelected={selectedTopic?.id === topic.id}
                                        onSelect={() => {
                                            setSelectedTopic(topic);
                                            onTopicClick(topic);
                                        }}
                                        priority="moderate"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Low Priority Topics */}
                    {categorizedTopics.low.length > 0 && (
                        <div className="priority-section low-section">
                            <div className="section-header">
                                <div className="section-icon">✅</div>
                                <div className="section-info">
                                    <h2 className="section-title">Low Priority</h2>
                                    <p className="section-desc">Well understood</p>
                                </div>
                                <div className="section-badge">{categorizedTopics.low.length}</div>
                            </div>
                            <div className="topics-grid">
                                {categorizedTopics.low.map((topic) => (
                                    <TopicCard
                                        key={topic.id}
                                        topic={topic}
                                        isSelected={selectedTopic?.id === topic.id}
                                        onSelect={() => {
                                            setSelectedTopic(topic);
                                            onTopicClick(topic);
                                        }}
                                        priority="low"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selectedTopic && (
                    <div className="detail-panel">
                        <div className="detail-header">
                            <h3>{selectedTopic.title}</h3>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedTopic(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="detail-body">
                            {/* Priority Badge */}
                            <div className={`priority-badge ${selectedTopic.urgencyScore > 0.66 ? 'urgent' : selectedTopic.urgencyScore > 0.33 ? 'moderate' : 'low'}`}>
                                {selectedTopic.urgencyScore > 0.66 ? 'URGENT' : selectedTopic.urgencyScore > 0.33 ? 'MODERATE' : 'LOW_PRIORITY'}
                            </div>

                            {/* Mastery Progress */}
                            <div className="detail-section">
                                <h4>Mastery Level</h4>
                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${selectedTopic.masteryLevel}%`,
                                                backgroundColor: selectedTopic.masteryLevel > 70 ? '#10b981' : selectedTopic.masteryLevel > 40 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <div className="progress-text">{selectedTopic.masteryLevel}%</div>
                                </div>
                            </div>

                            {/* ML Recommendation */}
                            <div className="detail-section">
                                <h4>🤖 AI Recommendation</h4>
                                <p className="recommendation-text">{selectedTopic.recommendation}</p>
                            </div>

                            {/* Learning Stats */}
                            <div className="detail-section">
                                <h4>Learning Activity</h4>
                                <div className="stats-mini-grid">
                                    <div className="stat-item">
                                        <div className="stat-label">Videos Watched</div>
                                        <div className="stat-value">{selectedTopic.videosWatched}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">Quizzes Taken</div>
                                        <div className="stat-value">{selectedTopic.quizzesTaken}</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">Revisions</div>
                                        <div className="stat-value">{selectedTopic.revisionCount}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="action-btn">
                                Start Learning →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {topicProgress.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📖</div>
                    <h3>No Topics Yet</h3>
                    <p>Start exploring courses to build your revision plan</p>
                </div>
            )}
        </div>
    );
};

/**
 * Topic Card Component - Individual topic visualization
 */
const TopicCard = ({ topic, isSelected, onSelect, priority }) => {
    const getPriorityColor = () => {
        switch (priority) {
            case 'urgent':
                return '#dc2626';
            case 'moderate':
                return '#f59e0b';
            case 'low':
                return '#10b981';
            default:
                return '#6366f1';
        }
    };

    return (
        <div
            className={`topic-card ${isSelected ? 'selected' : ''} ${priority}`}
            onClick={onSelect}
            style={{
                '--priority-color': getPriorityColor(),
            }}
        >
            <div className="card-header">
                <h3 className="card-title">{topic.title}</h3>
                <div className="card-badge">{Math.round(topic.masteryLevel)}%</div>
            </div>

            <div className="card-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${topic.masteryLevel}%`,
                            backgroundColor: getPriorityColor(),
                        }}
                    />
                </div>
            </div>

            <div className="card-stats">
                <span className="stat">📚 {topic.quizzesTaken} Quizzes</span>
                <span className="stat">📺 {topic.videosWatched} Videos</span>
            </div>

            <p className="card-recommendation">{topic.recommendation}</p>

            <div className="card-hover-action">
                View Details →
            </div>
        </div>
    );
};

export default ModernMindMap;
