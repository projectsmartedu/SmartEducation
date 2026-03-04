/**
 * Mind Map Data Adapter
 * Transforms ML predictions + student data into visual mind map format
 * Handles:
 *   - Dynamic data from revision urgency model
 *   - Color coding by urgency score
 *   - Interactive node formatting
 *   - Edge relationships
 */

export class MindMapAdapter {
  /**
   * Transform raw student progress data into mind map nodes/edges
   * @param {Object} studentData - Student info
   * @param {Array} topicProgress - Array of {name, mastery, last_studied, attempts, last_score, practice_hours}
   * @param {Array} mlPredictions - ML urgency predictions for each topic
   * @returns {Object} {nodes, edges, metadata}
   */
  static toMindMapFormat(studentData, topicProgress, mlPredictions) {
    const nodes = [];
    const edges = [];

    // Root node: Student
    const rootId = `student-${studentData.id || 'root'}`;
    nodes.push({
      id: rootId,
      label: `${studentData.name || 'Study Plan'}`,
      data: {
        type: 'root',
        studentId: studentData.id,
        studentName: studentData.name,
        totalTopics: topicProgress.length,
      },
      position: { x: 0, y: 0 },
      style: {
        background: '#6366f1',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        border: '3px solid #4f46e5',
        width: '180px',
      },
    });

    // Topic nodes with urgency-based styling
    topicProgress.forEach((topic, index) => {
      const prediction = mlPredictions[index] || {};
      const urgencyScore = prediction.urgencyScore || 0.5;
      const topicId = `topic-${index}`;

      // Determine color and styling based on urgency
      let nodeColor, borderColor, textColor;
      let urgencyPrefix = 'MOD';

      if (urgencyScore > 0.66) {
        nodeColor = '#fef3c7'; // Light amber
        borderColor = '#f59e0b'; // Orange
        textColor = '#92400e';
        urgencyPrefix = 'HIGH';
      } else if (urgencyScore > 0.33) {
        nodeColor = '#fef3c7';
        borderColor = '#eab308';
        textColor = '#713f12';
        urgencyPrefix = 'MOD';
      } else {
        nodeColor = '#dcfce7';
        borderColor = '#22c55e';
        textColor = '#166534';
        urgencyPrefix = 'LOW';
      }

      // Calculate node position in circular layout
      const angle = (index / topicProgress.length) * 2 * Math.PI;
      const radius = 280;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      nodes.push({
        id: topicId,
        label: `[${urgencyPrefix}] ${topic.name || `Topic ${index + 1}`}`,
        data: {
          type: 'topic',
          topicName: topic.name,
          mastery: topic.mastery,
          masteryPercent: Math.round(topic.mastery * 100),
          lastStudied: topic.last_studied,
          attempts: topic.attempts,
          lastScore: topic.last_score,
          practiceHours: topic.practice_hours,
          urgencyScore: urgencyScore,
          urgencyCategory: prediction.urgency || 'MODERATE',
          recommendation: prediction.recommendation || 'Continue current pace',
        },
        position: { x, y },
        style: {
          background: nodeColor,
          color: textColor,
          fontWeight: '600',
          fontSize: '12px',
          padding: '10px',
          borderRadius: '8px',
          border: `3px solid ${borderColor}`,
          width: '160px',
          boxShadow: `0 4px 12px ${borderColor}33`,
          cursor: 'pointer',
        },
      });

      // Edge from root to topic
      edges.push({
        id: `edge-${rootId}-${topicId}`,
        source: rootId,
        target: topicId,
        animated: urgencyScore > 0.66, // Animate urgent topics
        style: {
          stroke: borderColor,
          strokeWidth: 2 + urgencyScore * 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: borderColor,
        },
      });
    });

    // Create subtopic relationships (optional: group by prerequisite)
    if (topicProgress.length >= 3) {
      // Connect related topics in sequence
      for (let i = 0; i < topicProgress.length - 1; i++) {
        edges.push({
          id: `edge-seq-${i}`,
          source: `topic-${i}`,
          target: `topic-${i + 1}`,
          animated: false,
          style: {
            stroke: '#d4d4d8',
            strokeWidth: 1,
            strokeDasharray: '5,5',
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#d4d4d8',
          },
        });
      }
    }

    return {
      nodes,
      edges,
      metadata: {
        studentId: studentData.id,
        studentName: studentData.name,
        generatedAt: new Date().toISOString(),
        totalTopics: topicProgress.length,
        urgentCount: mlPredictions.filter((p) => p.urgencyScore > 0.66).length,
        moderateCount: mlPredictions.filter((p) => p.urgencyScore > 0.33 && p.urgencyScore <= 0.66).length,
        lowCount: mlPredictions.filter((p) => p.urgencyScore <= 0.33).length,
      },
    };
  }

  /**
   * Format node data for display in tooltips/cards
   */
  static formatNodeInfo(node) {
    if (node.data.type === 'root') {
      return {
        type: 'Student Profile',
        content: [
          `Name: ${node.data.studentName}`,
          `Total Topics: ${node.data.totalTopics}`,
          `Action: Review all topics below`,
        ],
      };
    }

    if (node.data.type === 'topic') {
      const masteryPercent = node.data.masteryPercent;
      const masteryBar =
        '█'.repeat(Math.floor(masteryPercent / 10)) + '░'.repeat(10 - Math.floor(masteryPercent / 10));

      return {
        type: `${node.data.urgencyCategory} URGENCY`,
        content: [
          `Topic: ${node.data.topicName}`,
          `Mastery: ${masteryBar} ${masteryPercent}%`,
          `Last Studied: ${node.data.lastStudied} days ago`,
          `Attempts: ${node.data.attempts}`,
          `Last Score: ${node.data.lastScore}/100`,
          `Practice Hours: ${node.data.practiceHours.toFixed(1)}h`,
          `---`,
          `Recommendation: ${node.data.recommendation}`,
        ],
      };
    }

    return null;
  }

  /**
   * Get urgency summary for dashboard
   */
  static getSummary(mlPredictions) {
    const urgent = mlPredictions.filter((p) => p.urgencyScore > 0.66).length;
    const moderate = mlPredictions.filter((p) => p.urgencyScore > 0.33 && p.urgencyScore <= 0.66).length;
    const low = mlPredictions.filter((p) => p.urgencyScore <= 0.33).length;

    return {
      urgent,
      moderate,
      low,
      total: mlPredictions.length,
      summary: `${urgent} urgent • ${moderate} moderate • ${low} on track`,
    };
  }

  /**
   * Generate study plan based on urgency scores
   */
  static generateStudyPlan(topicProgress, mlPredictions) {
    const plan = {
      immediate: [],
      thisWeek: [],
      nextWeek: [],
      maintenance: [],
    };

    topicProgress.forEach((topic, index) => {
      const pred = mlPredictions[index];
      const score = pred.urgencyScore || 0.5;

      const item = {
        topic: topic.name,
        urgency: pred.urgency,
        recommendation: pred.recommendation,
        estimatedHours: Math.max(1, Math.ceil((1 - topic.mastery) * 5)),
      };

      if (score > 0.66) {
        plan.immediate.push(item);
      } else if (score > 0.33) {
        plan.thisWeek.push(item);
      } else if (topic.mastery < 0.8) {
        plan.nextWeek.push(item);
      } else {
        plan.maintenance.push(item);
      }
    });

    return plan;
  }
}

export default MindMapAdapter;
