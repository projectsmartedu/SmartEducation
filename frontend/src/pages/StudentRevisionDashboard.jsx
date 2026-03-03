import React, { useState, useEffect } from 'react';
import RevisionMindMap from '../components/RevisionMindMap';
import { predictStudentRisk, generateRevisionMindMap } from '../services/mlService';

/**
 * Student Revision Dashboard
 * 
 * This page demonstrates the complete ML pipeline:
 * 1. Loads student progress data
 * 2. Calls ML service for risk & revision predictions
 * 3. Displays beautiful mind map with urgency indicators
 * 4. Allows editing and study plan generation
 */
const StudentRevisionDashboard = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated student data (replace with API call)
  const mockStudentData = {
    id: 'student-001',
    name: 'Harsh Sharma',
    prior_failures: 1,
    study_time: 3,
    absences: 5,
    parent_edu: 3,
    family_support: 1,
    health: 4,
    internet: 1,
    activities: 1,
    travel_time: 2,
    age: 18,
    paid_support: 0,
  };

  const mockTopicProgress = [
    {
      name: 'Calculus - Derivatives',
      mastery: 0.75,
      last_studied: 3,
      attempts: 5,
      last_score: 82,
      practice_hours: 8,
    },
    {
      name: 'Calculus - Integration',
      mastery: 0.45,
      last_studied: 12,
      attempts: 2,
      last_score: 58,
      practice_hours: 2,
    },
    {
      name: 'Linear Algebra',
      mastery: 0.62,
      last_studied: 7,
      attempts: 4,
      last_score: 70,
      practice_hours: 5,
    },
    {
      name: 'Probability Theory',
      mastery: 0.35,
      last_studied: 25,
      attempts: 1,
      last_score: 42,
      practice_hours: 1,
    },
    {
      name: 'Statistics',
      mastery: 0.55,
      last_studied: 5,
      attempts: 3,
      last_score: 65,
      practice_hours: 4,
    },
    {
      name: 'Complex Numbers',
      mastery: 0.88,
      last_studied: 1,
      attempts: 7,
      last_score: 94,
      practice_hours: 12,
    },
    {
      name: 'Differential Equations',
      mastery: 0.40,
      last_studied: 20,
      attempts: 2,
      last_score: 50,
      practice_hours: 2,
    },
    {
      name: 'Vector Calculus',
      mastery: 0.70,
      last_studied: 4,
      attempts: 4,
      last_score: 78,
      practice_hours: 6,
    },
  ];

  // Load data and predictions on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set student data
        setStudent(mockStudentData);
        setTopicProgress(mockTopicProgress);

        // Call ML service for risk prediction
        console.log('📡 Calling ML service for risk prediction...');
        const riskResult = await predictStudentRisk(mockStudentData);
        console.log('✅ Risk prediction:', riskResult);
        setRiskPrediction(riskResult);

        // Call ML service for revision urgency predictions
        console.log('📡 Calling ML service for revision urgency...');
        
        // Extract revision features from topic progress
        const revisionPredictions = mockTopicProgress.map((topic) =>
          // Simulate ML prediction call (in production, batch these)
          ({
            topicName: topic.name,
            urgencyScore: calculateUrgencyScore(topic), // This would come from ML service
            urgency:
              calculateUrgencyScore(topic) > 0.66
                ? 'URGENT'
                : calculateUrgencyScore(topic) > 0.33
                ? 'MODERATE'
                : 'LOW',
            recommendation: getRecommendation(topic),
          })
        );
        
        setPredictions(revisionPredictions);
        console.log('✅ Revision predictions:', revisionPredictions);

        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [studentId]);

  // Helper: Calculate urgency score (simplified - ML service does this)
  const calculateUrgencyScore = (topic) => {
    // Typically from ML model, but here's a simple formula:
    // Low mastery + long time since studied = high urgency
    const masteryFactor = (1 - topic.mastery) * 0.6;
    const staleFactor = Math.min(topic.last_studied / 30, 1) * 0.4;
    return Math.min(masteryFactor + staleFactor, 1);
  };

  // Helper: Get recommendation text
  const getRecommendation = (topic) => {
    const urgency = calculateUrgencyScore(topic);
    if (urgency > 0.66) {
      return `🚨 Start revision immediately. ${topic.name} hasn't been studied in ${topic.last_studied} days and mastery is only ${Math.round(topic.mastery * 100)}%.`;
    } else if (urgency > 0.33) {
      return `⚠️ Schedule revision soon. Review ${topic.name} this week to maintain skills.`;
    } else {
      return `✅ Continue current pace. ${topic.name} is well-maintained at ${Math.round(topic.mastery * 100)}% mastery.`;
    }
  };

  // Handle topic update from mind map
  const handleTopicUpdate = (updatedTopic) => {
    console.log('📝 Topic updated:', updatedTopic);
    // In production, save to database
    // Also trigger new ML prediction for this topic
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your revision dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>⚠️ Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="student-revision-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 {student?.name}'s Revision Dashboard</h1>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Overall Risk</span>
            <span
              className={`stat-value risk-${riskPrediction?.category?.toLowerCase()}`}
            >
              {riskPrediction?.category || 'N/A'}
            </span>
            <span className="stat-score">
              {riskPrediction?.riskScore
                ? `${(riskPrediction.riskScore * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Avg Mastery</span>
            <span className="stat-value">
              {topicProgress
                ? `${Math.round(
                    (topicProgress.reduce((sum, t) => sum + t.mastery, 0) /
                      topicProgress.length) *
                      100
                  )}%`
                : 'N/A'}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Topics</span>
            <span className="stat-value">{topicProgress?.length || 0}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value">Now</span>
          </div>
        </div>
      </div>

      {/* Risk Alert (if applicable) */}
      {riskPrediction?.category === 'HIGH' && (
        <div className="alert alert-danger">
          <h3>🚨 Student at Risk</h3>
          <p>{riskPrediction?.intervention}</p>
          <p>
            <strong>Action:</strong> Consider scheduling a meeting with this student to discuss support options.
          </p>
        </div>
      )}

      {riskPrediction?.category === 'MEDIUM' && (
        <div className="alert alert-warning">
          <h3>⚠️ Student Needs Support</h3>
          <p>{riskPrediction?.intervention}</p>
        </div>
      )}

      {/* Main Content: Mind Map */}
      {predictions && (
        <RevisionMindMap
          studentData={student}
          topicProgress={topicProgress}
          mlPredictions={predictions}
          onUpdate={handleTopicUpdate}
        />
      )}

      {/* ML Model Information Card */}
      <div className="info-card">
        <h3>🤖 How This Works</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Risk Prediction Model</h4>
            <p>
              <strong>Type:</strong> XGBoost Classifier <br />
              <strong>Inputs:</strong> 11 pre-exam features (failures, study time, family support, etc.) <br />
              <strong>Output:</strong> Risk probability 0-1, categorized as HIGH/MEDIUM/LOW <br />
              <strong>Accuracy:</strong> Test AUC 0.9013 (90% discrimination)
            </p>
          </div>

          <div className="info-item">
            <h4>Revision Urgency Model</h4>
            <p>
              <strong>Type:</strong> Gradient Boosting Classifier <br />
              <strong>Inputs:</strong> 6 features per topic (mastery, last studied, attempts, score, etc.) <br />
              <strong>Output:</strong> Urgency probability 0-1, categorized as URGENT/MODERATE/LOW <br />
              <strong>Accuracy:</strong> Test AUC 0.9166 (91.7% discrimination)
            </p>
          </div>

          <div className="info-item">
            <h4>Mind Map Visualization</h4>
            <p>
              <strong>Layout:</strong> Radial/circular with root node at center <br />
              <strong>Nodes:</strong> Color-coded by urgency (🔴 red, 🟡 amber, 🟢 green) <br />
              <strong>Edges:</strong> Thickness/animation based on urgency score <br />
              <strong>Interactive:</strong> Click to edit, hover for details
            </p>
          </div>

          <div className="info-item">
            <h4>Data Flow</h4>
            <p>
              1️⃣ React Component collects data <br />
              2️⃣ Calls `/api/ml/risk/predict` & `/api/ml/revision/topic-urgency` <br />
              3️⃣ Backend proxies to ML Service <br />
              4️⃣ Python loads .pkl models, generates predictions <br />
              5️⃣ Results display with visualizations
            </p>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="code-examples">
        <h3>💻 Integration Code Examples</h3>

        <div className="code-block">
          <h4>Using predictStudentRisk()</h4>
          <pre>{`import { predictStudentRisk } from '../services/mlService';

const prediction = await predictStudentRisk({
  prior_failures: 1,
  study_time: 3,
  absences: 5,
  // ... 8 more features
});

console.log(prediction);
// Output: { riskScore: 0.42, category: 'MEDIUM', intervention: '...' }`}</pre>
        </div>

        <div className="code-block">
          <h4>Using getTopicUrgency()</h4>
          <pre>{`import { getTopicUrgency } from '../services/mlService';

const urgency = await getTopicUrgency({
  mastery: 0.45,
  last_studied: 12,
  attempts: 2,
  last_score: 58,
  practice_hours: 2,
});

console.log(urgency);
// Output: { urgencyScore: 0.78, urgency: 'URGENT', recommendation: '...' }`}</pre>
        </div>

        <div className="code-block">
          <h4>Using RevisionMindMap Component</h4>
          <pre>{`<RevisionMindMap
  studentData={student}
  topicProgress={topics}
  mlPredictions={predictions}
  onUpdate={(updatedTopic) => console.log('Saved:', updatedTopic)}
/>`}</pre>
        </div>
      </div>
    </div>
  );
};

export default StudentRevisionDashboard;

/* ============================================ */
/* Basic Styles for Dashboard */
/* ============================================ */

const dashboardStyles = `
.student-revision-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-loading,
.dashboard-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #4b5563;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 16px 0;
  font-size: 32px;
  color: #1e1b4b;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e1b4b;
}

.stat-value.risk-high { color: #dc2626; }
.stat-value.risk-medium { color: #f59e0b; }
.stat-value.risk-low { color: #22c55e; }

.stat-score {
  font-size: 12px;
  color: #6b7280;
}

.alert {
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.alert h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.alert p {
  margin: 0 0 6px 0;
}

.alert-danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-color: #dc2626;
}

.alert-warning {
  background: #fef3c7;
  color: #78350f;
  border-color: #f59e0b;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.info-card h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #1e1b4b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1e1b4b;
  font-weight: 700;
}

.info-item p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #4b5563;
}

.code-examples {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.code-examples h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #1e1b4b;
}

.code-block {
  margin-bottom: 16px;
  background: #1e1b4b;
  border-radius: 8px;
  overflow: hidden;
}

.code-block h4 {
  margin: 0;
  padding: 12px 16px;
  background: #0f172a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  color: #a1a1a1;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
}
`;
