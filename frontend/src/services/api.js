import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Backend uses cookies for auth
});

// removed manual header interceptor since token is HttpOnly cookie

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, redirecting to login...');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/signup', userData),
  logout: () => api.post('/logout'),
};

export const studentService = {
  getAvailableTests: (params) => api.get('/student/tests', { params }),
  getAttempts: () => api.get('/student/attempts'),
  getAttempt: (attemptId) => api.get(`/student/attempts/${attemptId}`),
  startTest: (testId) => api.post(`/student/tests/${testId}/start`),
  submitTest: (attemptId, answers) => api.post(`/student/tests/${attemptId}/submit`, { answers }),
  getAttemptResults: (attemptId) => api.get(`/student/results/${attemptId}`),
  searchTests: (q) => api.get('/student/search', { params: { q } }),
  updateExams: (exams) => api.post('/student/exams', { exams }),
  
  // Phase 3 Extensions
  reportQuestion: (data) => api.post('/student/report-question', data),
  getFlashcards: (filters) => api.get('/student/flashcards', { params: filters }),
  bookmarkItem: (data) => api.post('/student/bookmarks', data),
  getBookmarks: (filters) => api.get('/student/bookmarks', { params: filters }),
  removeBookmark: (bookmarkId) => api.delete(`/student/bookmarks/${bookmarkId}`),
  
  // Resources
  getResources: (params) => api.get('/resources', { params }),
  viewResource: (id) => api.get(`/resources/${id}/view`, { responseType: 'blob' }),
};

export const instructorService = {
  getQuizzes: () => api.get('/instructor/quizzes'),
  getQuestionsForQuiz: (testId) => api.get(`/instructor/quizzes/${testId}/questions`),
  createQuiz: (quizData) => api.post('/instructor/quizzes', quizData),
  deleteQuiz: (testId) => api.delete(`/instructor/quizzes/${testId}`),
  uploadQuestionsCSV: (testId, formData, encodedLimits = '') => {
    const query = encodedLimits ? `?limits=${encodedLimits}` : '';
    return api.post(`/instructor/quizzes/${testId}/upload-csv${query}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  editQuestion: (questionId, questionData) => api.put(`/instructor/questions/${questionId}`, questionData),
  
  // Phase 3 Extensions
  uploadFlashcardsCSV: (formData) => api.post('/instructor/flashcards/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getReports: () => api.get('/instructor/reports'),
  updateReportStatus: (reportId, status) => api.patch(`/instructor/reports/${reportId}/status`, { status }),
  
  // Resources
  getResources: () => api.get('/resources'),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  uploadResource: (formData) => api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getOnlineUsers: () => api.get('/admin/online-users'),
  getRecentAttempts: () => api.get('/admin/recent-attempts'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  blockUser: (userId) => api.patch(`/admin/users/${userId}/block`),
};
