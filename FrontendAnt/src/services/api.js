import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Función recursiva para corregir errores de encoding (ej: Ã³ -> ó)
const fixEncoding = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    try {
      // Intenta corregir strings que fueron mal interpretados como ISO-8859-1
      return decodeURIComponent(escape(obj));
    } catch (e) {
      return obj;
    }
  }
  if (Array.isArray(obj)) {
    return obj.map(fixEncoding);
  }
  if (typeof obj === 'object') {
    const fixedObj = {};
    for (const key in obj) {
      fixedObj[key] = fixEncoding(obj[key]);
    }
    return fixedObj;
  }
  return obj;
};

// Interceptor para limpiar caracteres extraños en la respuesta
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = fixEncoding(response.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
