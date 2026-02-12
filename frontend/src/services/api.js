import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return API.post('/auth/login', formData);
  },
  getProfile: () => API.get('/auth/me')
};

export const userAPI = {
  getProfile: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/me', data),  //Changed from /users/me
  getStats: () => API.get('/users/stats'),
  getDetailedStats: () => API.get('/users/stats/detailed')
};

export const workoutAPI = {
  getAll: (params) => API.get('/workouts', { params }),
  getById: (id) => API.get(`/workouts/${id}`),
  create: (data) => API.post('/workouts', data),
  update: (id, data) => API.put(`/workouts/${id}`, data),
  delete: (id) => API.delete(`/workouts/${id}`)
};

export const mealAPI = {
  getAll: (params) => API.get('/meals', { params }),
  getById: (id) => API.get(`/meals/${id}`),
  create: (data) => API.post('/meals', data),
  update: (id, data) => API.put(`/meals/${id}`, data),
  delete: (id) => API.delete(`/meals/${id}`)
};

export const waterAPI = {
  getAll: (params) => API.get('/water', { params }),
  getToday: () => API.get('/water/today'),
  add: (data) => API.post('/water', data),
  update: (id, data) => API.put(`/water/${id}`, data),
  delete: (id) => API.delete(`/water/${id}`),
  getStats: (params) => API.get('/water/stats', { params }),
  resetToday: () => API.delete('/water/today/reset')
};

export const aiAPI = {
  getDietRecommendations: (data) => API.post('/ai/diet-recommendations', data),
  getWorkoutPlan: (data) => API.post('/ai/workout-plan', data),
  predictCalories: (data) => API.post('/ai/predict-calories', data),
  getFoodDatabase: () => API.get('/ai/food-database'),
  generateMealSuggestion: (mealType, targetCalories) => 
    API.post('/ai/generate-meal-suggestion', null, {
      params: { meal_type: mealType, target_calories: targetCalories }
    }),
  chatWithTrainer: (question) => 
    API.post('/ai/chat-with-trainer', null, {
      params: { question: question }
    })
};

export const socialAPI = {
  getFeed: (params) => API.get('/social/feed', { params }),
  createPost: (data) => API.post('/social/posts', data),
  likePost: (id) => API.post(`/social/posts/${id}/like`),
  commentPost: (id, text) => API.post(`/social/posts/${id}/comment`, { text })
};