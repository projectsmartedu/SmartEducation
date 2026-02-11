import axios from 'axios';

// Use Vite env var for deployments, fallback to relative API for dev/proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth and redirect if we're online (real auth failure)
      // When offline, keep the stored credentials
      if (navigator.onLine) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // Network errors — don't redirect, let pages handle offline fallback
    if (!error.response) {
      const networkError = new Error('Network error. Please try again.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getByRole: (role) => api.get(`/users/role/${role}`),
  create: (userData) => api.post('/users', userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getRecentActivity: () => api.get('/users/activity'),
  getCredentials: () => api.get('/users/credentials')
};

// Chat API (Student only)
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history')
};

// Materials API
export const materialsAPI = {
  // Get all materials with optional filters
  getAll: (params = {}) => api.get('/materials', { params }),
  // Get material by ID
  getById: (id) => api.get(`/materials/${id}`),
  // Upload text material (Teacher/Admin)
  upload: (data) => api.post('/materials', data),
  // Upload PDF material (Teacher/Admin)
  uploadPDF: (data) => api.post('/materials/pdf', data),
  // Update material (Teacher/Admin)
  update: (id, data) => api.put(`/materials/${id}`, data),
  // Delete material (Teacher/Admin)
  delete: (id) => api.delete(`/materials/${id}`),
  // Get my uploaded materials (Teacher/Admin)
  getMyMaterials: (params = {}) => api.get('/materials/user/my', { params }),
  // Get all subjects
  getSubjects: () => api.get('/materials/subjects'),
  // Get topics for a subject
  getTopics: (subject) => api.get(`/materials/topics/${encodeURIComponent(subject)}`),
  // Get processing status
  getStatus: (id) => api.get(`/materials/${id}/status`)
};

// Doubts API (Student)
export const doubtsAPI = {
  // Submit a doubt and get AI answer
  submit: (data) => api.post('/doubts', data),
  // Get doubt by ID
  getById: (id) => api.get(`/doubts/${id}`),
  // Get my doubts history
  getMyDoubts: (params = {}) => api.get('/doubts/my', { params }),
  // Search materials before asking
  searchMaterials: (data) => api.post('/doubts/search-materials', data),
  // Get available subjects
  getSubjects: () => api.get('/doubts/subjects'),
  // Get topics for a subject
  getTopics: (subject) => api.get(`/doubts/topics/${encodeURIComponent(subject)}`),
  // Get stats
  getStats: () => api.get('/doubts/stats')
};

// Courses API
export const coursesAPI = {
  getAll: (params = {}) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my'),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  unenroll: (id) => api.post(`/courses/${id}/unenroll`),
  // Topics within a course
  getTopics: (courseId) => api.get(`/courses/${courseId}/topics`),
  getTopicContent: (courseId, topicId) => api.get(`/courses/${courseId}/topics/${topicId}/content`),
  createTopic: (courseId, data) => api.post(`/courses/${courseId}/topics`, data),
  updateTopic: (courseId, topicId, data) => api.put(`/courses/${courseId}/topics/${topicId}`, data),
  deleteTopic: (courseId, topicId) => api.delete(`/courses/${courseId}/topics/${topicId}`)
};

// Progress API
export const progressAPI = {
  getMyProgress: (params = {}) => api.get('/progress', { params }),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  updateProgress: (topicId, data) => api.put(`/progress/${topicId}`, data),
  getKnowledgeMap: (courseId) => api.get('/progress/knowledge-map', { params: courseId ? { courseId } : {} }),
  getStats: () => api.get('/progress/stats'),
  // Teacher endpoints
  getStudentProgress: (studentId) => api.get(`/progress/student/${studentId}`),
  getClassProgress: (courseId) => api.get(`/progress/class/${courseId}`)
};

// Revisions API
export const revisionsAPI = {
  getMyRevisions: (params = {}) => api.get('/revisions', { params }),
  getById: (id) => api.get(`/revisions/${id}`),
  complete: (id, data) => api.put(`/revisions/${id}/complete`, data),
  skip: (id) => api.put(`/revisions/${id}/skip`),
  getStats: () => api.get('/revisions/stats'),
  // Teacher endpoints
  create: (data) => api.post('/revisions', data),
  delete: (id) => api.delete(`/revisions/${id}`),
  getStudentRevisions: (studentId, params = {}) => api.get(`/revisions/student/${studentId}`, { params })
};

// Gamification API
export const gamificationAPI = {
  getMyProfile: () => api.get('/gamification/profile'),
  getLeaderboard: (params = {}) => api.get('/gamification/leaderboard', { params }),
  getMyBadges: () => api.get('/gamification/badges'),
  getPointsHistory: (params = {}) => api.get('/gamification/history', { params }),
  getStats: () => api.get('/gamification/stats'),
  getActivityHeatmap: () => api.get('/gamification/activity-heatmap'),
  // Teacher endpoint
  getClassOverview: () => api.get('/gamification/overview')
};

// AI Mock API
export const aiAPI = {
  predictMastery: (data) => api.post('/ai/predict-mastery', data),
  predictForgetting: (data) => api.post('/ai/predict-forgetting', data),
  getLearningPace: () => api.get('/ai/learning-pace'),
  getRecommendations: () => api.get('/ai/recommendations')
};

export default api;
