import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import authService from '../../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    nombre: '',
    username: '',
    email: '',
    telefono: '',
    first_name: '',
    last_name: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        setUserData({
          ...data,
          nombre: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Usuario',
        });
      } catch (err) {
         console.error("Error cargando perfil:", err);
         if (err.response?.status === 401) {
            navigate('/'); // Token expirado o ausente
         }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('¡Perfil actualizado con éxito!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Perderás todo tu historial de pedidos y beneficios acumulados.')) {
      alert('Tu cuenta ha sido eliminada. Lamentamos verte partir.');
      // Simulamos logout y redireccionamos
      localStorage.removeItem('access_token');
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div className="profile-layout">
      <Header />

      <main className="profile-main">
        <h1 className="profile-title">Mi Perfil</h1>
        <p className="profile-subtitle">Gestiona tu información personal y configuración de la cuenta.</p>
        
        {loading ? (
          <div className="profile-card card-shadow-soft" style={{ textAlign: 'center', padding: '40px' }}>
            Cargando información del perfil...
          </div>
        ) : (
          <div className="profile-card card-shadow-soft">
            <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-initial">{userData.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <div className="profile-main-info">
              <h2>{userData.nombre}</h2>
              <p>Cliente Vanelis</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                name="nombre" 
                value={userData.nombre} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                name="email" 
                value={userData.email} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono (Opcional)</label>
              <input 
                type="tel" 
                name="telefono" 
                value={userData.telefono} 
                onChange={handleInputChange} 
                disabled={!isEditing}
              />
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar Cambios</button>
                </>
              ) : (
                <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>Editar Perfil</button>
              )}
            </div>
          </form>

          <div className="danger-zone">
            <h3>Zona de Peligro</h3>
            <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor asegura tu decisión.</p>
            <button type="button" className="btn-delete" onClick={handleDeleteAccount}>Eliminar Cuenta</button>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
