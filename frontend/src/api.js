// frontend/src/api.js
import axios from 'axios';

// Lê a variável de ambiente. Se não existir (em produção), o valor é uma string vazia.
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  // Concatena a base com o prefixo /api.
  // Em dev: 'http://localhost:3000' + '/api' -> 'http://localhost:3000/api'
  // Em prod: '' + '/api' -> '/api'
  baseURL: `${baseURL}/api`,
});

// Interceptor que adiciona o token de autenticação a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;