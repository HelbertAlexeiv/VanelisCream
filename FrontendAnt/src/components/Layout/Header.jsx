import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import vanelisLogo from '../../assets/vanelis-logo.png';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = ({ searchTerm, onSearchChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <header className="store-header" id="store-header">
      {/* Barra superior roja */}
      <div className="header-top">
        <div className="header-top-inner">
          {/* Logo */}
          <div className="header-logo" onClick={() => navigate('/tienda')} style={{ cursor: 'pointer' }}>
            <img src={vanelisLogo} alt="Vanelis Cream" className="header-logo-img" />
          </div>

          {/* Barra de búsqueda */}
          <div className="header-search">
            <input
              type="text"
              id="search-input"
              placeholder="Buscar sabores..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            <button className="search-btn" id="search-btn" aria-label="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Acciones (carrito y perfil) */}
          <div className="header-actions">
            <button 
              className="header-action-btn cart-btn" 
              id="cart-btn" 
              onClick={() => navigate('/carrito')}
              aria-label="Carrito"
            >
              <div className="cart-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>
              <span className="cart-label">Carrito</span>
            </button>
            <button 
              className="header-action-btn orders-shortcut-btn" 
              id="orders-shortcut-btn" 
              onClick={() => navigate('/mis-pedidos')} 
              aria-label="Mis Pedidos"
              title="Mis Pedidos"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </button>
            <button className="header-action-btn profile-btn" id="profile-btn" onClick={() => navigate('/perfil')} aria-label="Perfil">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>

            {/* Hamburger mobile */}
            <button
              className="mobile-menu-btn"
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span><span></span><span></span>
              </span>
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
