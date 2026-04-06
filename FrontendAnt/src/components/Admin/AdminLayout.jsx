import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import vanelisLogo from '../../assets/vanelis-logo.png';
import authService from '../../services/authService';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
      } catch (error) {
        console.error("Error loading admin profile:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active-tab' : '';
  };

  return (
    <div className="admin-layout">
      {/* Curved Administrative Header */}
      <header className="admin-header">
        <div className="admin-header-row">
          {/* 1. Logo (Left) */}
          <Link to="/admin/dashboard" className="admin-logo-link">
             <img src={vanelisLogo} alt="Vanelis Cream" className="admin-logo" />
          </Link>

          {/* 2. Navigation Tabs (Center) */}
          <nav className="admin-nav-tabs">
            <Link to="/admin/dashboard" className={`tab-btn ${isActive('/admin/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/admin/pedidos" className={`tab-btn ${isActive('/admin/pedidos')}`}>
              Gestión Pedidos
            </Link>
            <div className="tab-separator">|</div>
            <Link to="/admin/despacho" className={`tab-btn ${isActive('/admin/despacho')}`}>
              Despacho
            </Link>
          </nav>

          {/* 3. Profile & Actions (Right) */}
          <div className="admin-user-actions">
            <div 
              className={`admin-profile-icon ${showProfileMenu ? 'active' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            
            {showProfileMenu && (
              <div className="admin-dropdown-menu card-shadow-soft">
                <div className="dropdown-user-info">
                  <p className="d-name">{user?.first_name || user?.username || 'Administrador'}</p>
                  <p className="d-role">{user?.rol?.nombre || 'Superusuario'}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => navigate('/admin/perfil')}>
                   Ver Perfil
                </button>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                   Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* The visual curve at the bottom */}
        <div className="header-curve-divider">
          <svg viewBox="0 0 1440 30" preserveAspectRatio="none">
             <path d="M0,0 L1440,0 L1440,30 Q720,0 0,30 Z" fill="#C62828" />
          </svg>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-content">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="admin-footer">
        <div className="footer-info">
          Ubicación: <span>UIS</span> | Horarios: <span>Lunes - Viernes 8am - 5pm</span> | Redes: 
          <div className="social-icons">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </div>
        </div>
        <div className="footer-copyright">
          © 2025 Vanelis Cream | <Link to="/privacidad">Políticas de privacidad</Link>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
