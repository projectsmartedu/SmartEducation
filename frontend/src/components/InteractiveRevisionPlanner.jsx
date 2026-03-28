import React, { useState, useMemo } from 'react';
import { ChevronDown, AlertCircle, Clock, CheckCircle2, Zap } from 'lucide-react';
import './InteractiveRevisionPlanner.css';

const InteractiveRevisionPlanner = ({ topicProgress = [], mlPredictions = {} }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({
        urgent: true,
        moderate: true,
        low: false
    });

    // Categorize topics by urgency
    const categorizedTopics = useMemo(() => {
        const urgent = [];
        const moderate = [];
        const low = [];

        if (!topicProgress || !Array.isArray(topicProgress)) {
            return { urgent, moderate, low };
        }

        topicProgress.forEach((topic) => {
            const prediction = mlPredictions[topic.id] || {
                urgencyScore: 0.5,
                riskCategory: 'MEDIUM'
            };

            if (prediction.riskCategory === 'HIGH' || prediction.urgencyScore > 0.66) {
                urgent.push({ ...topic, ...prediction });
            } else if (prediction.riskCategory === 'MEDIUM' || prediction.urgencyScore > 0.33) {
                moderate.push({ ...topic, ...prediction });
            } else {
                low.push({ ...topic, ...prediction });
            }
        });

        return { urgent, moderate, low };
    }, [topicProgress, mlPredictions]);

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const renderSVGArrows = () => {
        if (!topicProgress.length) return null;

        return (
            <svg className="revision-arrows" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <marker id="arrowhead-urgent" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                    </marker>
                    <marker id="arrowhead-moderate" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                    </marker>
                    <marker id="arrowhead-low" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                </defs>

                {/* Central node */}
                <circle cx="400" cy="100" r="45" fill="#4338ca" opacity="0.1" stroke="#4338ca" strokeWidth="2" />
                <text x="400" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4338ca">
                    Revision Plan
                </text>

                {/* Arrows from center to categories */}
                {categorizedTopics.urgent.length > 0 && (
                    <path
                        d="M 350 140 Q 250 250 180 350"
                        stroke="#ef4444"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead-urgent)"
                        opacity="0.5"
                    />
                )}
                {categorizedTopics.moderate.length > 0 && (
                    <path
                        d="M 400 145 L 400 300"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead-moderate)"
                        opacity="0.5"
                    />
                )}
                {categorizedTopics.low.length > 0 && (
                    <path
                        d="M 450 140 Q 550 250 620 350"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead-low)"
                        opacity="0.5"
                    />
                )}
            </svg>
        );
    };

    const CategorySection = ({ category, topics, icon: Icon, color, bgColor, borderColor }) => {
        const isExpanded = expandedCategories[category];

        return (
            <div className="category-section">
                <button
                    onClick={() => toggleCategory(category)}
                    className={`category-header ${color}`}
                >
                    <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                            <h3 className="font-semibold">{
                                category === 'urgent' ? '🔴 Urgent - Start Now' :
                                    category === 'moderate' ? '🟡 Moderate - This Week' :
                                        '🟢 Low Priority - Later'
                            }</h3>
                            <p className="text-xs opacity-75">{topics.length} topic{topics.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                    <div className="topics-grid">
                        {topics.map((topic, idx) => (
                            <div
                                key={topic.id || idx}
                                onClick={() => setSelectedTopic(topic)}
                                className={`topic-card ${selectedTopic?.id === topic.id ? 'active' : ''} ${bgColor}`}
                            >
                                <div className="topic-header">
                                    <h4 className="topic-name">{topic.name}</h4>
                                    <span className={`urgency-badge ${borderColor}`}>
                                        {(topic.urgencyScore ? (topic.urgencyScore * 100).toFixed(0) : '50')}%
                                    </span>
                                </div>

                                <div className="topic-stats">
                                    <div className="stat">
                                        <span className="stat-icon">📊</span>
                                        <span className="stat-value">{topic.masteryPercentage || 0}%</span>
                                        <span className="stat-label">Mastery</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-icon">📅</span>
                                        <span className="stat-value">{topic.daysSinceReview || 0}</span>
                                        <span className="stat-label">Days ago</span>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${topic.masteryPercentage || 0}%`,
                                            backgroundColor: category === 'urgent' ? '#ef4444' : category === 'moderate' ? '#f59e0b' : '#10b981'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="interactive-revision-planner">
            <div className="planner-container">
                {/* SVG Arrows Background */}
                <div className="svg-background">
                    {renderSVGArrows()}
                </div>

                {/* Main Content */}
                <div className="planner-content">
                    {/* Header */}
                    <div className="planner-header">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f172a]">
                                Your Personalized Revision Plan
                            </h2>
                            <p className="text-sm text-[#64748b] mt-1">
                                Interactive AI-powered revision scheduler
                            </p>
                        </div>
                        <div className="stats-summary">
                            <div className="stat-box">
                                <span className="stat-number">{topicProgress.length}</span>
                                <span className="stat-name">Topics</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">{categorizedTopics.urgent.length}</span>
                                <span className="stat-name">Urgent</span>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="categories-container">
                        <CategorySection
                            category="urgent"
                            topics={categorizedTopics.urgent}
                            icon={AlertCircle}
                            color="urgent"
                            bgColor="bg-red-50"
                            borderColor="border-red-200"
                        />
                        <CategorySection
                            category="moderate"
                            topics={categorizedTopics.moderate}
                            icon={Clock}
                            color="moderate"
                            bgColor="bg-amber-50"
                            borderColor="border-amber-200"
                        />
                        <CategorySection
                            category="low"
                            topics={categorizedTopics.low}
                            icon={CheckCircle2}
                            color="low"
                            bgColor="bg-green-50"
                            borderColor="border-green-200"
                        />
                    </div>
                </div>

                {/* Details Panel */}
                {selectedTopic && (
                    <div className="details-panel">
                        <div className="details-header">
                            <h3 className="text-lg font-semibold text-[#0f172a]">{selectedTopic.name}</h3>
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="text-[#64748b] hover:text-[#0f172a]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="details-content">
                            {/* Urgency Gauge */}
                            <div className="detail-section">
                                <h4 className="detail-title">Urgency Level</h4>
                                <div className="urgency-gauge">
                                    <div className="gauge-bar">
                                        <div
                                            className="gauge-fill"
                                            style={{
                                                width: `${(selectedTopic.urgencyScore || 0.5) * 100}%`,
                                                backgroundColor:
                                                    selectedTopic.riskCategory === 'HIGH' ? '#ef4444' :
                                                        selectedTopic.riskCategory === 'MEDIUM' ? '#f59e0b' :
                                                            '#10b981'
                                            }}
                                        />
                                    </div>
                                    <p className="gauge-label mt-2">
                                        {selectedTopic.riskCategory || 'MEDIUM'} PRIORITY
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="detail-section">
                                <h4 className="detail-title">Performance Metrics</h4>
                                <div className="metrics-grid">
                                    <MetricCard
                                        icon="📊"
                                        label="Mastery"
                                        value={`${selectedTopic.masteryPercentage || 0}%`}
                                        color="text-blue-600"
                                    />
                                    <MetricCard
                                        icon="📅"
                                        label="Last Reviewed"
                                        value={`${selectedTopic.daysSinceReview || 0}d ago`}
                                        color="text-purple-600"
                                    />
                                    <MetricCard
                                        icon="✅"
                                        label="Quizzes"
                                        value={selectedTopic.quizzesTaken || 0}
                                        color="text-green-600"
                                    />
                                    <MetricCard
                                        icon="🎬"
                                        label="Videos"
                                        value={selectedTopic.videosWatched || 0}
                                        color="text-orange-600"
                                    />
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="detail-section">
                                <h4 className="detail-title">AI Recommendation</h4>
                                <div className="recommendation-box">
                                    <Zap className="h-4 w-4 text-[#4338ca]" />
                                    <p className="text-sm text-[#475569]">
                                        {selectedTopic.recommendation ||
                                            'Stay consistent with your revision schedule to maintain mastery.'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="detail-actions">
                                <button className="action-btn primary">
                                    Start Revision
                                </button>
                                <button className="action-btn secondary">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color }) => (
    <div className="metric-card">
        <span className="metric-icon">{icon}</span>
        <p className="metric-label">{label}</p>
        <p className={`metric-value ${color}`}>{value}</p>
    </div>
);

export default InteractiveRevisionPlanner;
