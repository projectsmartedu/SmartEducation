import React, { useState } from 'react';
import './TraditionalMindMap.css';

/**
 * Beautiful Traditional Mind Map Component
 * Hierarchical branches radiating from center
 */
const TraditionalMindMap = ({ studentData, topicProgress, mlPredictions }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    if (!mlPredictions || mlPredictions.length === 0) {
        return <div className="mindmap-loading">Loading mind map...</div>;
    }

    // Organize topics by urgency
    const urgent = mlPredictions.filter(p => p.urgency === 'URGENT');
    const moderate = mlPredictions.filter(p => p.urgency === 'MODERATE');
    const low = mlPredictions.filter(p => p.urgency === 'LOW');

    // Calculate positions for radial layout
    const centerX = 500;
    const centerY = 400;
    const radius = 250;

    const getBranchPositions = (count, startAngle) => {
        const positions = [];
        const angleStep = Math.PI / (count + 1);
        for (let i = 0; i < count; i++) {
            const angle = startAngle + angleStep * (i + 1);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x, y, angle });
        }
        return positions;
    };

    // Get positions for each branch (top, right, bottom, left)
    const urgentPositions = getBranchPositions(Math.max(urgent.length, 1), Math.PI / 2); // Top
    const moderatePositions = getBranchPositions(Math.max(moderate.length, 1), 0); // Right
    const lowPositions = getBranchPositions(Math.max(low.length, 1), -Math.PI / 2); // Bottom

    return (
        <div className="traditional-mindmap">
            <svg width="1000" height="800" className="mindmap-svg">
                {/* Draw connecting lines from center */}
                {/* Urgent lines */}
                {urgentPositions.map((pos, idx) => (
                    <line
                        key={`line-urgent-${idx}`}
                        x1={centerX}
                        y1={centerY}
                        x2={pos.x}
                        y2={pos.y}
                        className="mindmap-line urgent"
                        strokeWidth="2"
                    />
                ))}

                {/* Moderate lines */}
                {moderatePositions.map((pos, idx) => (
                    <line
                        key={`line-moderate-${idx}`}
                        x1={centerX}
                        y1={centerY}
                        x2={pos.x}
                        y2={pos.y}
                        className="mindmap-line moderate"
                        strokeWidth="2"
                    />
                ))}

                {/* Low lines */}
                {lowPositions.map((pos, idx) => (
                    <line
                        key={`line-low-${idx}`}
                        x1={centerX}
                        y1={centerY}
                        x2={pos.x}
                        y2={pos.y}
                        className="mindmap-line low"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Center node */}
            <div className="mindmap-center">
                <div className="center-node">
                    <div className="center-icon">📚</div>
                    <div className="center-text">Revision Plan</div>
                    <div className="center-subtitle">{topicProgress?.length || 0} Topics</div>
                </div>
            </div>

            {/* Urgent Branch - Top Left */}
            <div className="mindmap-branch urgent-branch">
                <div className="branch-title">🚨 URGENT</div>
                <div className="branch-topics">
                    {urgent.map((topic, idx) => (
                        <div
                            key={idx}
                            className="topic-node urgent-node"
                            onClick={() => setSelectedNode(topic)}
                        >
                            <div className="node-icon">⚡</div>
                            <div className="node-name">{topic.topicName}</div>
                            <div className="node-score">{Math.round(topic.urgencyScore * 100)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moderate Branch - Top Right */}
            <div className="mindmap-branch moderate-branch">
                <div className="branch-title">⚠️ MODERATE</div>
                <div className="branch-topics">
                    {moderate.map((topic, idx) => (
                        <div
                            key={idx}
                            className="topic-node moderate-node"
                            onClick={() => setSelectedNode(topic)}
                        >
                            <div className="node-icon">📝</div>
                            <div className="node-name">{topic.topicName}</div>
                            <div className="node-score">{Math.round(topic.urgencyScore * 100)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Low Priority Branch - Bottom */}
            <div className="mindmap-branch low-branch">
                <div className="branch-title">✅ LOW PRIORITY</div>
                <div className="branch-topics">
                    {low.map((topic, idx) => (
                        <div
                            key={idx}
                            className="topic-node low-node"
                            onClick={() => setSelectedNode(topic)}
                        >
                            <div className="node-icon">✓</div>
                            <div className="node-name">{topic.topicName}</div>
                            <div className="node-score">{Math.round(topic.urgencyScore * 100)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
                <div className="node-details-panel">
                    <button className="close-btn" onClick={() => setSelectedNode(null)}>✕</button>
                    <h3>{selectedNode.topicName}</h3>
                    <div className="detail-stat">
                        <span>Urgency Score:</span>
                        <strong>{Math.round(selectedNode.urgencyScore * 100)}%</strong>
                    </div>
                    <div className="detail-stat">
                        <span>Status:</span>
                        <strong className={`status-${selectedNode.urgency.toLowerCase()}`}>{selectedNode.urgency}</strong>
                    </div>
                    <div className="detail-text">
                        {selectedNode.urgency === 'URGENT' && '⚡ Start revision immediately!'}
                        {selectedNode.urgency === 'MODERATE' && '📝 Schedule revision this week'}
                        {selectedNode.urgency === 'LOW' && '✅ Maintain current pace'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TraditionalMindMap;
