import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthPage.css';
import iceCreamImg from '../../assets/ice-cream-cup.png';
import vanelisLogo from '../../assets/vanelis-logo.png';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="auth-page">
      {/* Header rojo curvo */}
      <div className="auth-header">
        <div className="auth-header-content">
          <img src={vanelisLogo} alt="Vanelis Cream" className="auth-logo" />
        </div>
        <div className="auth-header-curve">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,0 L0,60 Q240,110 480,70 Q720,30 960,70 Q1200,110 1440,60 L1440,0 Z"
              fill="#C62828"
            />
          </svg>
        </div>
      </div>

      {/* Panel Central */}
      <div className="auth-container">
        <div className="auth-panel">
          <div className="auth-panel-content">
            {/* Formulario */}
            <div className="auth-form-section">
              {isLogin ? (
                <LoginForm onSwitchToRegister={toggleForm} />
              ) : (
                <RegisterForm onSwitchToLogin={toggleForm} />
              )}
            </div>

            {/* Imagen decorativa del helado */}
            <div className="auth-decoration">
              <img
                src={iceCreamImg}
                alt="Helado Vanelis Cream"
                className="auth-ice-cream-img"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        <p>© 2024 Vanelis Cream | Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AuthPage;
