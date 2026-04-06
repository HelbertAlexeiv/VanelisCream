import api from './api';

/**
 * Servicio de autenticación para Vanelis Cream
 */
const authService = {
  /**
   * RF2 - Iniciar sesión
   * POST /api/auth/login
   * @param {Object} credentials - { username, password }
   * @returns {Promise} Respuesta del servidor con el token
   */
  login: async (credentials) => {
    const payload = {
      username: credentials.username,
      password: credentials.password,
    };
    
    // El endpoint real tiene un slash final usualmente: /api/auth/login/
    const response = await api.post('/api/auth/login/', payload);
    
    // Almacenar token
    if (response.data && response.data.token) {
      localStorage.setItem('access_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * RF1 - Registrar nuevo usuario
   * POST /api/auth/registro
   * @param {Object} userData - Datos completos del usuario
   * @returns {Promise} Respuesta del servidor
   */
  register: async (userData) => {
    const payload = {
      username: userData.username,
      password: userData.password,
      password2: userData.password, // Duplicamos password para cumplir validación temporalmente si el UI no lo envía
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || ''
    };
    // El endpoint real tiene un slash final: /api/auth/registro/
    const response = await api.post('/api/auth/registro/', payload);
    return response.data;
  },

  /**
   * Obtener usuario actual
   * GET /api/auth/me/
   */
  getMe: async () => {
    const response = await api.get('/api/auth/me/');
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
