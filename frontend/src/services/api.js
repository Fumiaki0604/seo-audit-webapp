import axios from 'axios';

// In production, use relative URLs; in development, use localhost
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (same origin)
  : process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🎯 Base URL: ${config.baseURL}`);
    console.log(`🌍 Full URL: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data.message || `Server error: ${status}`);
    } else if (error.request) {
      // Network error
      throw new Error('ネットワークエラーが発生しました。接続を確認してください。');
    } else {
      // Other error
      throw new Error(error.message || '予期しないエラーが発生しました。');
    }
  }
);

export const seoAPI = {
  // SEO分析実行
  analyze: async (url, options = {}) => {
    try {
      const response = await api.post('/api/analyze', {
        url,
        options
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // API動作確認
  test: async () => {
    try {
      const response = await api.get('/api/analyze/test');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ヘルスチェック
  health: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;