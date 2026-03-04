import React, { useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, CircleDashed, X } from 'lucide-react';
import './TraditionalMindMap.css';

const TraditionalMindMap = ({ studentData, topicProgress, mlPredictions }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    if (!mlPredictions || mlPredictions.length === 0) {
        return <div className="mindmap-loading">Loading mind map...</div>;
    }

    const urgent = mlPredictions.filter(p => p.urgency === 'URGENT');
    const moderate = mlPredictions.filter(p => p.urgency === 'MODERATE');
    const low = mlPredictions.filter(p => p.urgency === 'LOW');
    const totalTopics = mlPredictions.length;

    const getUrgencyColor = (urgency) => {
        switch(urgency) {
            case 'URGENT': return '#dc2626';
            case 'MODERATE': return '#f59e0b';
            case 'LOW': return '#22c55e';
            default: return '#64748b';
        }
    };

    const renderTopicCard = (topic, index) => (
        <div
            key={`${topic.urgency}-${index}`}
            className="topic-card"
            style={{ borderLeftColor: getUrgencyColor(topic.urgency) }}
            onClick={() => setSelectedNode(topic)}
        >
            <div className="card-header">
                <h4 className="card-title">{topic.topicName}</h4>
                <span className={`urgency-badge urgency-${topic.urgency.toLowerCase()}`}>
                    {topic.urgency}
                </span>
            </div>
            <div className="card-body">
                <div className="urgency-score">
                    <span className="score-label">Priority Score:</span>
                    <span className="score-value">{(topic.urgencyScore * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mindmap-container">
            <div className="mindmap-header">
                <h2>Revision Study Plan</h2>
                <p className="header-subtitle">Total Topics: {totalTopics}</p>
            </div>

            <div className="mindmap-grid">
                {/* Left Column - Urgent Topics */}
                <div className="mindmap-column urgent-column">
                    <div className="column-header">
                        <span className="header-icon"><AlertTriangle size={16} /></span>
                        <h3>Urgent</h3>
                        <span className="badge red">{urgent.length}</span>
                    </div>
                    <div className="topics-list">
                        {urgent.length > 0 ? (
                            urgent.map((topic, idx) => renderTopicCard(topic, idx))
                        ) : (
                            <div className="empty-state">No urgent topics</div>
                        )}
                    </div>
                </div>

                {/* Center Column - Hub */}
                <div className="mindmap-column center-column">
                    <div className="center-hub">
                        <div className="hub-circle">
                            <div className="hub-icon"><BarChart3 size={20} /></div>
                            <div className="hub-title">Revision Hub</div>
                            <div className="hub-count">{totalTopics} Topics</div>
                        </div>
                        <div className="hub-stats">
                            <div className="stat-item">
                                <span className="stat-urgent">{urgent.length}</span>
                                <span className="stat-label">Urgent</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-moderate">{moderate.length}</span>
                                <span className="stat-label">Moderate</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-low">{low.length}</span>
                                <span className="stat-label">Low</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Moderate Topics */}
                <div className="mindmap-column moderate-column">
                    <div className="column-header">
                        <span className="header-icon"><CircleDashed size={16} /></span>
                        <h3>Moderate</h3>
                        <span className="badge amber">{moderate.length}</span>
                    </div>
                    <div className="topics-list">
                        {moderate.length > 0 ? (
                            moderate.map((topic, idx) => renderTopicCard(topic, idx))
                        ) : (
                            <div className="empty-state">No moderate topics</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Low Priority */}
            <div className="mindmap-bottom">
                <div className="column-header">
                    <span className="header-icon"><CheckCircle2 size={16} /></span>
                    <h3>Low Priority</h3>
                    <span className="badge green">{low.length}</span>
                </div>
                <div className="bottom-topics-grid">
                    {low.length > 0 ? (
                        low.map((topic, idx) => renderTopicCard(topic, idx))
                    ) : (
                        <div className="empty-state">No low priority topics</div>
                    )}
                </div>
            </div>

            {/* Details Overlay */}
            {selectedNode && (
                <div className="details-overlay">
                    <div className="details-panel">
                        <button className="close-details" onClick={() => setSelectedNode(null)} title="Close">
                            <X size={16} />
                        </button>
                        <div className="details-header">
                            <h2>{selectedNode.topicName}</h2>
                            <span className={`urgency-badge-large urgency-${selectedNode.urgency.toLowerCase()}`}>
                                {selectedNode.urgency}
                            </span>
                        </div>
                        <div className="details-content">
                            <div className="detail-group">
                                <label>Priority Score</label>
                                <div className="score-bar">
                                    <div 
                                        className="score-fill"
                                        style={{
                                            width: `${selectedNode.urgencyScore * 100}%`,
                                            backgroundColor: getUrgencyColor(selectedNode.urgency)
                                        }}
                                    />
                                </div>
                                <span className="score-number">{Math.round(selectedNode.urgencyScore * 100)}%</span>
                            </div>
                            <div className="detail-group">
                                <label>Recommendation</label>
                                <p className="recommendation">
                                    {selectedNode.urgency === 'URGENT' && 'Start your revision immediately. This topic needs urgent attention to prepare effectively.'}
                                    {selectedNode.urgency === 'MODERATE' && 'Schedule this topic for revision this week. Maintain a balanced study schedule.'}
                                    {selectedNode.urgency === 'LOW' && 'You are well-prepared. Continue at your current pace and maintain your preparation level.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TraditionalMindMap;
