import React from 'react';
// Example mind map data structure
const sampleData = {
  nodes: [
    { id: 'math', label: 'Math', mastered: true },
    { id: 'algebra', label: 'Algebra', mastered: false },
    { id: 'geometry', label: 'Geometry', mastered: true }
  ],
  edges: [
    { from: 'math', to: 'algebra' },
    { from: 'math', to: 'geometry' }
  ]
};

// Simple visual mind map (replace with D3.js, react-flow, or similar for advanced)
export default function MindMap({ data = sampleData }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Student Knowledge Map</h2>
      <svg width={400} height={250}>
        {/* Render nodes */}
        {data.nodes.map((node, i) => (
          <circle
            key={node.id}
            cx={100 + i * 120}
            cy={120}
            r={30}
            fill={node.mastered ? '#2ca02c' : '#d62728'}
          />
        ))}
        {/* Render labels */}
        {data.nodes.map((node, i) => (
          <text
            key={node.id + '-label'}
            x={100 + i * 120}
            y={120}
            textAnchor="middle"
            fill="#fff"
            fontSize={16}
            dy={6}
          >
            {node.label}
          </text>
        ))}
        {/* Render edges */}
        {data.edges.map((edge, i) => {
          const fromIdx = data.nodes.findIndex(n => n.id === edge.from);
          const toIdx = data.nodes.findIndex(n => n.id === edge.to);
          return (
            <line
              key={i}
              x1={100 + fromIdx * 120}
              y1={120}
              x2={100 + toIdx * 120}
              y2={120}
              stroke="#888"
              strokeWidth={3}
            />
          );
        })}
      </svg>
    </div>
  );
}
