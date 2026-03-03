import React, { useState, useEffect } from 'react';
import './RevisionMindMap.css';
import MindMapAdapter from '../adapters/mindmapAdapter';

/**
 * Interactive Revision Mind Map Component
 * Features:
 *   - Visual representation of topics with urgency indicators
 *   - Dynamic ML predictions integrated
 *   - Editable nodes (mastery, notes)
 *   - Color-coded by urgency (red/amber/green)
 *   - Hover tooltips with detailed info
 *   - Study plan generation
 */
const RevisionMindMap = ({ studentData, topicProgress, mlPredictions, onUpdate }) => {
  const [mindMapData, setMindMapData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [filter, setFilter] = useState('all'); // all, urgent, moderate, low

  // Initialize mind map data
  useEffect(() => {
    if (topicProgress && mlPredictions) {
      const adapted = MindMapAdapter.toMindMapFormat(studentData, topicProgress, mlPredictions);
      setMindMapData(adapted);

      const plan = MindMapAdapter.generateStudyPlan(topicProgress, mlPredictions);
      setStudyPlan(plan);
    }
  }, [studentData, topicProgress, mlPredictions]);

  // Filter nodes based on urgency
  const getFilteredNodes = () => {
    if (!mindMapData) return [];
    return mindMapData.nodes.filter((node) => {
      if (filter === 'all') return true;
      if (filter === 'urgent') return node.data.urgencyScore > 0.66;
      if (filter === 'moderate') return node.data.urgencyScore > 0.33 && node.data.urgencyScore <= 0.66;
      if (filter === 'low') return node.data.urgencyScore <= 0.33;
      return true;
    });
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (node.data.type === 'topic') {
      setEditingTopic(node.data);
    }
  };

  const handleEditSave = (updatedData) => {
    // Update local state
    if (onUpdate) {
      onUpdate(updatedData);
    }
    setEditMode(false);
    setEditingTopic(null);
  };

  const getSummary = () => {
    if (!mlPredictions) return null;
    return MindMapAdapter.getSummary(mlPredictions);
  };

  const summary = getSummary();
  const filteredNodes = getFilteredNodes();

  if (!mindMapData) {
    return (
      <div className="mind-map-container">
        <div className="loading">Loading mind map...</div>
      </div>
    );
  }

  return (
    <div className="mind-map-wrapper">
      {/* Header */}
      <div className="mind-map-header">
        <h2>📚 Revision Mind Map</h2>
        <div className="header-info">
          <span>{summary?.summary}</span>
          <button
            className="btn-edit-toggle"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '💾 Save' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mind-map-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({mindMapData.nodes.length - 1})
          </button>
          <button
            className={`filter-btn urgent ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            🔴 Urgent ({summary?.urgent || 0})
          </button>
          <button
            className={`filter-btn moderate ${filter === 'moderate' ? 'active' : ''}`}
            onClick={() => setFilter('moderate')}
          >
            🟡 Moderate ({summary?.moderate || 0})
          </button>
          <button
            className={`filter-btn low ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            🟢 Low ({summary?.low || 0})
          </button>
        </div>
      </div>

      <div className="mind-map-content">
        {/* Mind Map Canvas */}
        <div className="mind-map-canvas">
          <svg className="canvas-svg" width="100%" height="600">
            <defs>
              <style>{`
                .node-circle { cursor: pointer; transition: all 0.2s; }
                .node-circle:hover { filter: drop-shadow(0 0 8px rgba(0,0,0,0.3)); }
                .node-text { pointer-events: none; font-family: Arial, sans-serif; }
              `}</style>
            </defs>

            {/* Render edges */}
            {mindMapData.edges.map((edge) => {
              const source = mindMapData.nodes.find((n) => n.id === edge.source);
              const target = mindMapData.nodes.find((n) => n.id === edge.target);
              if (!source || !target) return null;

              const x1 = 400 + source.position.x;
              const y1 = 300 + source.position.y;
              const x2 = 400 + target.position.x;
              const y2 = 300 + target.position.y;

              return (
                <line
                  key={edge.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.style?.stroke || '#999'}
                  strokeWidth={edge.style?.strokeWidth || 2}
                  strokeDasharray={edge.style?.strokeDasharray || 'none'}
                  markerEnd="url(#arrowhead)"
                  opacity="0.6"
                />
              );
            })}

            {/* Render nodes */}
            {filteredNodes.map((node) => {
              const x = 400 + node.position.x;
              const y = 300 + node.position.y;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                  className="node-group"
                >
                  {/* Node background (rounded rect) */}
                  <rect
                    x={x - 60}
                    y={y - 35}
                    width="120"
                    height="70"
                    rx="8"
                    fill={node.style.background}
                    stroke={isSelected ? '#000' : node.style.border}
                    strokeWidth={isSelected ? 3 : 2}
                    className="node-circle"
                  />

                  {/* Node text */}
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={node.style.color}
                    fontSize="12"
                    fontWeight="600"
                    className="node-text"
                  >
                    {node.label}
                  </text>

                  {/* Mastery indicator (if topic) */}
                  {node.data.masteryPercent && (
                    <text
                      x={x}
                      y={y + 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={node.style.color}
                      fontSize="10"
                      className="node-text"
                    >
                      Mastery: {node.data.masteryPercent}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredNode && selectedNode?.id === hoveredNode && (
            <div className="node-tooltip">
              {MindMapAdapter.formatNodeInfo(selectedNode)?.content.map((line, i) => (
                <div key={i} className="tooltip-line">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="mind-map-details">
          {selectedNode ? (
            <div className="node-details">
              <h3>{selectedNode.label}</h3>

              {selectedNode.data.type === 'topic' && !editMode && (
                <div className="detail-info">
                  <div className="detail-item">
                    <span className="label">Mastery:</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${selectedNode.data.masteryPercent}%` }}
                      />
                      <span className="progress-text">{selectedNode.data.masteryPercent}%</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="label">Urgency:</span>
                    <span className="urgency-badge" style={{ color: selectedNode.data.urgencyScore > 0.66 ? '#dc2626' : selectedNode.data.urgencyScore > 0.33 ? '#f59e0b' : '#22c55e' }}>
                      {selectedNode.data.urgencyCategory}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Last Studied:</span>
                    <span>{selectedNode.data.lastStudied} days ago</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Attempts:</span>
                    <span>{selectedNode.data.attempts}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Last Score:</span>
                    <span>{selectedNode.data.lastScore}/100</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Practice Hours:</span>
                    <span>{selectedNode.data.practiceHours.toFixed(1)}h</span>
                  </div>

                  <div className="detail-recommendation">
                    <strong>📋 Recommendation:</strong>
                    <p>{selectedNode.data.recommendation}</p>
                  </div>

                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditMode(true);
                      setEditingTopic(selectedNode.data);
                    }}
                  >
                    ✏️ Edit Topic
                  </button>
                </div>
              )}

              {editMode && editingTopic && selectedNode.data.type === 'topic' && (
                <EditNodePanel
                  node={editingTopic}
                  onSave={handleEditSave}
                  onCancel={() => setEditMode(false)}
                />
              )}
            </div>
          ) : (
            <div className="no-selection">
              <p>👆 Click on a topic to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Study Plan */}
      {studyPlan && (
        <div className="study-plan">
          <h3>📅 Study Plan</h3>
          <div className="plan-grid">
            <div className="plan-section urgent">
              <h4>🔴 Do Immediately</h4>
              <ul>
                {studyPlan.immediate.map((item, i) => (
                  <li key={i}>
                    {item.topic} ({item.estimatedHours}h)
                  </li>
                ))}
                {studyPlan.immediate.length === 0 && <li className="empty">All clear!</li>}
              </ul>
            </div>

            <div className="plan-section moderate">
              <h4>🟡 This Week</h4>
              <ul>
                {studyPlan.thisWeek.map((item, i) => (
                  <li key={i}>
                    {item.topic} ({item.estimatedHours}h)
                  </li>
                ))}
                {studyPlan.thisWeek.length === 0 && <li className="empty">None</li>}
              </ul>
            </div>

            <div className="plan-section low">
              <h4>🟢 Maintain</h4>
              <ul>
                {studyPlan.maintenance.map((item, i) => (
                  <li key={i}>
                    {item.topic} ({item.estimatedHours}h)
                  </li>
                ))}
                {studyPlan.maintenance.length === 0 && <li className="empty">None</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Edit Node Panel - Editable form for topic data
 */
const EditNodePanel = ({ node, onSave, onCancel }) => {
  const [formData, setFormData] = useState(node);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }));
  };

  return (
    <div className="edit-panel">
      <div className="form-group">
        <label>Mastery Level (0-1):</label>
        <input
          type="number"
          name="mastery"
          min="0"
          max="1"
          step="0.05"
          value={formData.mastery}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Last Studied (days ago):</label>
        <input
          type="number"
          name="lastStudied"
          min="0"
          value={formData.lastStudied}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Attempts:</label>
        <input
          type="number"
          name="attempts"
          min="0"
          value={formData.attempts}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Last Score (0-100):</label>
        <input
          type="number"
          name="lastScore"
          min="0"
          max="100"
          value={formData.lastScore}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Practice Hours:</label>
        <input
          type="number"
          name="practiceHours"
          min="0"
          step="0.5"
          value={formData.practiceHours}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button className="btn-save" onClick={() => onSave(formData)}>
          💾 Save Changes
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default RevisionMindMap;
