import React, { useState, useEffect, useRef, useMemo } from 'react';
import './InteractiveMindMap.css';

const InteractiveMindMap = ({ studentData, topicProgress = [], mlPredictions = {} }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const canvasRef = useRef(null);

    // Categorize topics by urgency
    const urgentTopics = topicProgress.filter(
        (t) => mlPredictions[t.id]?.urgencyScore > 0.66
    );
    const moderateTopics = topicProgress.filter(
        (t) => (mlPredictions[t.id]?.urgencyScore || 0) > 0.33 && (mlPredictions[t.id]?.urgencyScore || 0) <= 0.66
    );
    const lowTopics = topicProgress.filter(
        (t) => (mlPredictions[t.id]?.urgencyScore || 0) <= 0.33
    );

    // Central node data
    const centralNode = {
        id: 'central',
        name: 'Revision Master',
        icon: '🧠',
        totalTopics: topicProgress.length,
        avgMastery: topicProgress.length > 0
            ? Math.round(topicProgress.reduce((sum, t) => sum + t.masteryPercentage, 0) / topicProgress.length)
            : 0,
    };

    // Create branch categories
    const branches = useMemo(() => [
        {
            id: 'urgent',
            label: 'Urgent Focus',
            icon: '🔴',
            color: '#dc2626',
            topics: urgentTopics,
            count: urgentTopics.length,
        },
        {
            id: 'moderate',
            label: 'Maintain Progress',
            icon: '🟠',
            color: '#f59e0b',
            topics: moderateTopics,
            count: moderateTopics.length,
        },
        {
            id: 'low',
            label: 'Well Mastered',
            icon: '🟢',
            color: '#10b981',
            topics: lowTopics,
            count: lowTopics.length,
        },
    ], [urgentTopics, moderateTopics, lowTopics]);

    // Draw connecting lines
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center point
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw lines to each branch
        branches.forEach((branch, idx) => {
            const angle = (idx / branches.length) * Math.PI * 2 - Math.PI / 2;
            const distance = 200;

            const branchX = centerX + Math.cos(angle) * distance;
            const branchY = centerY + Math.sin(angle) * distance;

            // Draw gradient line
            const gradient = ctx.createLinearGradient(centerX, centerY, branchX, branchY);
            gradient.addColorStop(0, branch.color + '40');
            gradient.addColorStop(1, branch.color + '20');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(branchX, branchY);
            ctx.stroke();

            // Draw connection dots
            ctx.fillStyle = branch.color;
            ctx.beginPath();
            ctx.arc(branchX, branchY, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }, [branches]);

    const getSelectedNodeData = () => {
        if (!selectedNode) return null;

        if (selectedNode.type === 'topic') {
            const topic = topicProgress.find((t) => t.id === selectedNode.id);
            const pred = mlPredictions[selectedNode.id];
            return {
                type: 'topic',
                data: { ...topic, ...pred },
            };
        }

        if (selectedNode.type === 'branch') {
            const branch = branches.find((b) => b.id === selectedNode.id);
            return {
                type: 'branch',
                data: branch,
            };
        }

        if (selectedNode.type === 'central') {
            return {
                type: 'central',
                data: centralNode,
            };
        }

        return null;
    };

    const selectedData = getSelectedNodeData();

    return (
        <div className="mind-map-container">
            {/* Canvas for lines */}
            <canvas ref={canvasRef} className="mind-map-canvas" />

            {/* Central Node */}
            <div className="mind-map-content">
                <div
                    className={`mind-map-central ${selectedNode?.type === 'central' ? 'selected' : ''}`}
                    onClick={() => setSelectedNode({ type: 'central', id: 'central' })}
                    onMouseEnter={() => setHoveredNode({ type: 'central' })}
                    onMouseLeave={() => setHoveredNode(null)}
                >
                    <div className="central-icon">{centralNode.icon}</div>
                    <div className="central-name">{centralNode.name}</div>
                    <div className="central-stats">
                        <div className="stat">
                            <span className="stat-label">Topics</span>
                            <span className="stat-value">{centralNode.totalTopics}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Avg Mastery</span>
                            <span className="stat-value">{centralNode.avgMastery}%</span>
                        </div>
                    </div>
                </div>

                {/* Branch Circles */}
                <svg className="mind-map-svg" viewBox="0 0 800 800">
                    {branches.map((branch, idx) => {
                        const angle = (idx / branches.length) * Math.PI * 2 - Math.PI / 2;
                        const distance = 220;
                        const cx = 400 + Math.cos(angle) * distance;
                        const cy = 400 + Math.sin(angle) * distance;

                        return (
                            <g
                                key={branch.id}
                                transform={`translate(${cx}, ${cy})`}
                                className="branch-group"
                                onClick={() => setSelectedNode({ type: 'branch', id: branch.id })}
                                onMouseEnter={() => setHoveredNode({ type: 'branch', id: branch.id })}
                                onMouseLeave={() => setHoveredNode(null)}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="50"
                                    fill={selectedNode?.id === branch.id ? branch.color : branch.color + '20'}
                                    stroke={branch.color}
                                    strokeWidth="2"
                                    className={`branch-circle ${hoveredNode?.id === branch.id ? 'hover' : ''}`}
                                />
                                <text
                                    x="0"
                                    y="-12"
                                    textAnchor="middle"
                                    className="branch-icon"
                                    fontSize="28"
                                >
                                    {branch.icon}
                                </text>
                                <text x="0" y="10" textAnchor="middle" className="branch-label" fontSize="12">
                                    {branch.label}
                                </text>
                                <text x="0" y="28" textAnchor="middle" className="branch-count" fontSize="16">
                                    {branch.count}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Topic Nodes around branches */}
                <div className="topic-nodes-container">
                    {branches.map((branch) =>
                        branch.topics.map((topic, topicIdx) => {
                            const angle = (branches.indexOf(branch) / branches.length) * Math.PI * 2 - Math.PI / 2;
                            const baseDistance = 220;
                            const topicAngle = angle + (topicIdx - branch.topics.length / 2) * 0.15;

                            const distance = baseDistance + 120;
                            const x = 50 + (Math.cos(topicAngle) * distance * 0.8);
                            const y = 50 + (Math.sin(topicAngle) * distance * 0.8);

                            return (
                                <div
                                    key={topic.id}
                                    className={`topic-node ${selectedNode?.id === topic.id ? 'selected' : ''}`}
                                    style={{
                                        left: `calc(50% + ${x}px)`,
                                        top: `calc(50% + ${y}px)`,
                                        borderColor: branch.color,
                                        backgroundColor:
                                            selectedNode?.id === topic.id ? branch.color + '20' : 'white',
                                    }}
                                    onClick={() => setSelectedNode({ type: 'topic', id: topic.id })}
                                    onMouseEnter={() => setHoveredNode({ type: 'topic', id: topic.id })}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    <div className="topic-name">{topic.name}</div>
                                    <div className="topic-mastery">
                                        <div className="mastery-bar">
                                            <div
                                                className="mastery-fill"
                                                style={{
                                                    width: `${topic.masteryPercentage}%`,
                                                    backgroundColor: branch.color,
                                                }}
                                            />
                                        </div>
                                        <span className="mastery-text">{topic.masteryPercentage}%</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div className={`detail-panel ${selectedData ? 'visible' : ''}`}>
                {selectedData?.type === 'central' && (
                    <div className="detail-content">
                        <div className="detail-header">
                            <div className="detail-icon">🧠</div>
                            <div>
                                <h2>Revision Master</h2>
                                <p>Overall Performance</p>
                            </div>
                        </div>
                        <div className="detail-stats">
                            <div className="stat-block">
                                <span className="stat-title">Total Topics</span>
                                <span className="stat-big">{centralNode.totalTopics}</span>
                            </div>
                            <div className="stat-block">
                                <span className="stat-title">Average Mastery</span>
                                <span className="stat-big">{centralNode.avgMastery}%</span>
                            </div>
                        </div>
                        <div className="detail-breakdown">
                            <h3>Your Revision Status</h3>
                            {branches.map((branch) => (
                                <div key={branch.id} className="breakdown-item">
                                    <div className="breakdown-label">
                                        <span className="breakdown-icon">{branch.icon}</span>
                                        <span>{branch.label}</span>
                                    </div>
                                    <span className="breakdown-count" style={{ color: branch.color }}>
                                        {branch.count} topics
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedData?.type === 'branch' && (
                    <div className="detail-content">
                        <div className="detail-header">
                            <div className="detail-icon">{selectedData.data.icon}</div>
                            <div>
                                <h2>{selectedData.data.label}</h2>
                                <p>{selectedData.data.count} topics in this category</p>
                            </div>
                        </div>
                        <div className="detail-stats">
                            <div className="stat-block">
                                <span className="stat-title">Category</span>
                                <span className="stat-big">{selectedData.data.label}</span>
                            </div>
                            <div className="stat-block">
                                <span className="stat-title">Topics</span>
                                <span className="stat-big">{selectedData.data.count}</span>
                            </div>
                        </div>
                        <div className="detail-recommendation">
                            <h3>Strategy</h3>
                            {selectedData.data.id === 'urgent' && (
                                <p>Start revision immediately. Focus on understanding core concepts and complete practice problems.</p>
                            )}
                            {selectedData.data.id === 'moderate' && (
                                <p>Schedule regular revision sessions this week. Review your notes and take some practice quizzes.</p>
                            )}
                            {selectedData.data.id === 'low' && (
                                <p>Well done! Maintain your current pace. Review occasionally to prevent decay of knowledge.</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedData?.type === 'topic' && (
                    <div className="detail-content">
                        <div className="detail-header">
                            <h2>{selectedData.data.name}</h2>
                        </div>
                        <div className="detail-stats">
                            <div className="stat-block">
                                <span className="stat-title">Mastery Level</span>
                                <div className="mastery-bar-large">
                                    <div
                                        className="mastery-fill"
                                        style={{
                                            width: `${selectedData.data.masteryPercentage}%`,
                                            backgroundColor:
                                                selectedData.data.urgencyScore > 0.66
                                                    ? '#dc2626'
                                                    : selectedData.data.urgencyScore > 0.33
                                                        ? '#f59e0b'
                                                        : '#10b981',
                                        }}
                                    />
                                </div>
                                <span className="mastery-text">{selectedData.data.masteryPercentage}%</span>
                            </div>
                        </div>
                        <div className="detail-metrics">
                            <h3>Learning Metrics</h3>
                            <div className="metric-row">
                                <span>Days Since Review:</span>
                                <strong>{selectedData.data.daysSinceReview} days</strong>
                            </div>
                            <div className="metric-row">
                                <span>Quizzes Taken:</span>
                                <strong>{selectedData.data.quizzesTaken}</strong>
                            </div>
                            <div className="metric-row">
                                <span>Videos Watched:</span>
                                <strong>{selectedData.data.videosWatched}</strong>
                            </div>
                            <div className="metric-row">
                                <span>Last Score:</span>
                                <strong>{selectedData.data.lastScore}%</strong>
                            </div>
                        </div>
                        <div className="detail-recommendation">
                            <h3>AI Recommendation</h3>
                            <p>{selectedData.data.recommendation}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractiveMindMap;
