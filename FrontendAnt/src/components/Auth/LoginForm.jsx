import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const LoginForm = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      console.log('Login exitoso:', response);
      
      // Obtener info del usuario para saber a dónde redirigir
      const user = await authService.getMe();
      const isAdmin = user.is_staff || 
                      user.is_superuser || 
                      user.rol?.nombre?.toLowerCase() === 'administrador';
      
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/tienda');
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <h1 className="auth-title">Bienvenido de nuevo!</h1>

      <form onSubmit={handleSubmit} className="auth-form" id="login-form">
        {error && (
          <div className="auth-error" id="login-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Campo de nombre de usuario */}
        <div className="input-group">
          <span className="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input
            type="text"
            name="username"
            id="login-username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        {/* Campo de contraseña */}
        <div className="input-group">
          <span className="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="login-password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            id="toggle-password-btn"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>

        {/* Botón de ingreso */}
        <button
          type="submit"
          className="auth-btn"
          id="login-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <span className="auth-btn-loading">
              <span className="spinner"></span>
              Ingresando...
            </span>
          ) : (
            'Ingresar'
          )}
        </button>
      </form>

      <div className="auth-links">
        <a href="#" className="forgot-password-link" id="forgot-password-link">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div className="auth-switch">
        <span>¿No tienes una cuenta?</span>
        <button
          className="switch-btn"
          onClick={onSwitchToRegister}
          id="switch-to-register-btn"
        >
          Crear una cuenta
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
