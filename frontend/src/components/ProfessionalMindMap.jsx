import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mermaid from 'mermaid';
import './ProfessionalMindMap.css';

const ProfessionalMindMap = ({ studentData, topicProgress = [], mlPredictions = {} }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const mermaidRef = useRef(null);

    // Categorize topics
    const urgentTopics = useMemo(
        () => topicProgress.filter((t) => mlPredictions[t.id]?.urgencyScore > 0.66),
        [topicProgress, mlPredictions]
    );
    const moderateTopics = useMemo(
        () => topicProgress.filter(
            (t) => (mlPredictions[t.id]?.urgencyScore || 0) > 0.33 && (mlPredictions[t.id]?.urgencyScore || 0) <= 0.66
        ),
        [topicProgress, mlPredictions]
    );
    const lowTopics = useMemo(
        () => topicProgress.filter((t) => (mlPredictions[t.id]?.urgencyScore || 0) <= 0.33),
        [topicProgress, mlPredictions]
    );

    // Generate Mermaid mind map syntax
    const generateMermaidDiagram = useCallback(() => {
        let diagram = 'mindmap\n';
        diagram += '  root((Revision Master))\n';

        // Urgent section
        if (urgentTopics.length > 0) {
            diagram += '    🔴 Urgent Focus\n';
            urgentTopics.forEach((topic) => {
                const mastery = topic.masteryPercentage;
                diagram += `      ${topic.name} (${mastery}%)\n`;
            });
        }

        // Moderate section
        if (moderateTopics.length > 0) {
            diagram += '    🟠 Maintain Progress\n';
            moderateTopics.forEach((topic) => {
                const mastery = topic.masteryPercentage;
                diagram += `      ${topic.name} (${mastery}%)\n`;
            });
        }

        // Low section
        if (lowTopics.length > 0) {
            diagram += '    🟢 Well Mastered\n';
            lowTopics.forEach((topic) => {
                const mastery = topic.masteryPercentage;
                diagram += `      ${topic.name} (${mastery}%)\n`;
            });
        }

        return diagram;
    }, [urgentTopics, moderateTopics, lowTopics]);

    // Initialize and render Mermaid
    useEffect(() => {
        const renderDiagram = async () => {
            if (mermaidRef.current && topicProgress.length > 0) {
                const diagram = generateMermaidDiagram();
                mermaidRef.current.innerHTML = `<div class="mermaid">${diagram}</div>`;

                try {
                    await mermaid.contentLoaded();
                    mermaid.run();
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                }
            }
        };

        renderDiagram();
    }, [generateMermaidDiagram, topicProgress.length]);

    const getSelectedNodeData = useCallback(() => {
        if (!selectedTopic) return null;
        const topic = topicProgress.find((t) => t.id === selectedTopic);
        if (!topic) return null;
        const pred = mlPredictions[topic.id];
        return { ...topic, ...pred };
    }, [selectedTopic, topicProgress, mlPredictions]);

    const selectedData = getSelectedNodeData();

    return (
        <div className="professional-mindmap-container">
            <div className="mindmap-diagram-wrapper" ref={mermaidRef}></div>

            {/* Stats Panel */}
            <div className="mindmap-stats-panel">
                <div className="stats-header">
                    <h2>Performance Overview</h2>
                    <p>Interactive Revision Planning</p>
                </div>

                <div className="stats-summary">
                    <div className="stat-item">
                        <div className="stat-icon urgent">🔴</div>
                        <div className="stat-content">
                            <span className="stat-label">Urgent Topics</span>
                            <span className="stat-value">{urgentTopics.length}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon moderate">🟠</div>
                        <div className="stat-content">
                            <span className="stat-label">Moderate</span>
                            <span className="stat-value">{moderateTopics.length}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon low">🟢</div>
                        <div className="stat-content">
                            <span className="stat-label">Well Mastered</span>
                            <span className="stat-value">{lowTopics.length}</span>
                        </div>
                    </div>
                </div>

                {/* Topic Detail Card */}
                {selectedData && (
                    <div className="topic-detail-card">
                        <h3>{selectedData.name}</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Mastery Level</label>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${selectedData.masteryPercentage}%`,
                                            backgroundColor:
                                                selectedData.urgencyScore > 0.66
                                                    ? '#dc2626'
                                                    : selectedData.urgencyScore > 0.33
                                                        ? '#f59e0b'
                                                        : '#10b981',
                                        }}
                                    ></div>
                                </div>
                                <span className="progress-text">{selectedData.masteryPercentage}%</span>
                            </div>

                            <div className="detail-item">
                                <label>Days Since Review</label>
                                <span className="detail-value">{selectedData.daysSinceReview} days</span>
                            </div>

                            <div className="detail-item">
                                <label>Quizzes Completed</label>
                                <span className="detail-value">{selectedData.quizzesTaken}</span>
                            </div>

                            <div className="detail-item">
                                <label>Last Score</label>
                                <span className="detail-value">{selectedData.lastScore}%</span>
                            </div>
                        </div>

                        {selectedData.recommendation && (
                            <div className="recommendation-box">
                                <h4>AI Recommendation</h4>
                                <p>{selectedData.recommendation}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* All Topics List */}
                <div className="topics-list">
                    <h4>All Topics</h4>
                    {urgentTopics.length > 0 && (
                        <div className="topics-section">
                            <span className="section-label urgent">Urgent Focus</span>
                            {urgentTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                                    onClick={() => setSelectedTopic(topic.id)}
                                >
                                    <span className="topic-name">{topic.name}</span>
                                    <span className="topic-mastery">{topic.masteryPercentage}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {moderateTopics.length > 0 && (
                        <div className="topics-section">
                            <span className="section-label moderate">Maintain Progress</span>
                            {moderateTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                                    onClick={() => setSelectedTopic(topic.id)}
                                >
                                    <span className="topic-name">{topic.name}</span>
                                    <span className="topic-mastery">{topic.masteryPercentage}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {lowTopics.length > 0 && (
                        <div className="topics-section">
                            <span className="section-label low">Well Mastered</span>
                            {lowTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                                    onClick={() => setSelectedTopic(topic.id)}
                                >
                                    <span className="topic-name">{topic.name}</span>
                                    <span className="topic-mastery">{topic.masteryPercentage}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfessionalMindMap;
