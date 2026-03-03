import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * ML Service - Risk Prediction & Revision Planning
 * Calls separate ML microservice for AI predictions
 */

// ============================================================================
// RISK PREDICTION APIs
// ============================================================================

/**
 * Get risk prediction for a single student
 * @param {Object} studentData - Student profile data
 * @returns {Object} Risk score, category, intervention recommendation
 */
export const predictStudentRisk = async (studentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/ml/risk/predict`,
      studentData
    );
    return response.data;
  } catch (error) {
    console.error('Risk prediction error:', error);
    throw new Error(error.response?.data?.error || 'Failed to predict risk');
  }
};

/**
 * Get risk predictions for multiple students (batch)
 * @param {Array} students - Array of student data objects
 * @returns {Object} Array of predictions
 */
export const batchPredictRisk = async (students) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/ml/risk/batch-predict`,
      { students }
    );
    return response.data;
  } catch (error) {
    console.error('Batch prediction error:', error);
    throw new Error(error.response?.data?.error || 'Failed to batch predict');
  }
};

/**
 * Get risk model info
 * @returns {Object} Model metadata and features
 */
export const getRiskModelInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/ml/risk/info`);
    return response.data;
  } catch (error) {
    console.error('Risk model info error:', error);
    throw new Error('Failed to fetch model info');
  }
};

// ============================================================================
// REVISION PLANNING APIs
// ============================================================================

/**
 * Generate personalized revision mind map for a student
 * @param {string} studentId - Student ID
 * @param {Array} topicProgress - Array of topic progress objects
 * @returns {Object} Mind map with nodes and edges
 */
export const generateRevisionMindMap = async (studentId, topicProgress) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/ml/revision/mindmap`,
      { studentId, topicProgress }
    );
    return response.data;
  } catch (error) {
    console.error('Mind map generation error:', error);
    throw new Error(error.response?.data?.error || 'Failed to generate mind map');
  }
};

/**
 * Get urgency score for a specific topic
 * @param {Object} topicData - Topic metrics (mastery, last_studied, etc.)
 * @returns {Object} Urgency score and recommendation
 */
export const getTopicUrgency = async (topicData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/ml/revision/topic-urgency`,
      topicData
    );
    return response.data;
  } catch (error) {
    console.error('Topic urgency error:', error);
    throw new Error(error.response?.data?.error || 'Failed to get urgency');
  }
};

/**
 * Get revision model info
 * @returns {Object} Model metadata and features
 */
export const getRevisionModelInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/ml/revision/info`);
    return response.data;
  } catch (error) {
    console.error('Revision model info error:', error);
    throw new Error('Failed to fetch model info');
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format risk score into category
 * @param {number} riskScore - Risk score (0-1)
 * @returns {string} Category badge
 */
export const getRiskCategory = (riskScore) => {
  if (riskScore > 0.66) {
    return { category: 'HIGH RISK', color: 'bg-red-500', icon: '🔴' };
  } else if (riskScore > 0.33) {
    return { category: 'MEDIUM RISK', color: 'bg-yellow-500', icon: '🟡' };
  }
  return { category: 'LOW RISK', color: 'bg-green-500', icon: '🟢' };
};

/**
 * Format urgency score into category
 * @param {number} urgencyScore - Urgency score (0-1)
 * @returns {string} Category badge
 */
export const getUrgencyCategory = (urgencyScore) => {
  if (urgencyScore > 0.66) {
    return { urgency: 'URGENT', color: 'bg-red-500', icon: '🔴' };
  } else if (urgencyScore > 0.33) {
    return { urgency: 'MODERATE', color: 'bg-yellow-500', icon: '🟡' };
  }
  return { urgency: 'LOW', color: 'bg-green-500', icon: '🟢' };
};

/**
 * Prepare student data for risk prediction
 * @param {Object} studentProfile - Student object from database
 * @returns {Object} Formatted data for ML model
 */
export const formatStudentForRiskPrediction = (studentProfile) => {
  return {
    prior_failures: studentProfile.priorFailures || 0,
    study_time: studentProfile.studyHours || 5,
    absences: studentProfile.absences || 0,
    parent_edu: studentProfile.parentEducation || 3,
    family_support: studentProfile.familySupport || 3,
    health: studentProfile.health || 4,
    internet: studentProfile.hasInternet ? 1 : 0,
    activities: studentProfile.participation ? 1 : 0,
    travel_time: studentProfile.travelTime || 2,
    age: studentProfile.age || 18,
    paid_support: studentProfile.paidTuition ? 1 : 0
  };
};

/**
 * Prepare topic data for urgency prediction
 * @param {Object} topicProgress - Topic progress object
 * @returns {Object} Formatted data for ML model
 */
export const formatTopicForUrgency = (topicProgress) => {
  return {
    mastery: topicProgress.masteryLevel || 0.5,
    last_studied: topicProgress.daysSinceReview || 7,
    attempts: topicProgress.practiceAttempts || 0,
    last_score: topicProgress.lastAssessmentScore || 0,
    practice_hours: topicProgress.totalPracticeHours || 0
  };
};

export default {
  // Risk APIs
  predictStudentRisk,
  batchPredictRisk,
  getRiskModelInfo,

  // Revision APIs
  generateRevisionMindMap,
  getTopicUrgency,
  getRevisionModelInfo,

  // Helpers
  getRiskCategory,
  getUrgencyCategory,
  formatStudentForRiskPrediction,
  formatTopicForUrgency
};
