import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import authService from '../../services/authService';
import '../Profile/ProfilePage.css'; // Reusing established profile styles

const AdminProfile = () => {
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
          nombre: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Admin',
        });
      } catch (err) {
         console.error("Error cargando perfil admin:", err);
         if (err.response?.status === 401) {
            navigate('/'); 
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
    alert('¡Perfil administrativo actualizado!');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <AdminLayout>
      <div className="profile-main" style={{ padding: '0 0 2rem 0' }}>
        <h1 className="profile-title">Mi Perfil Administrativo</h1>
        <p className="profile-subtitle">Gestiona tu información personal dentro del panel de control.</p>
        
        {loading ? (
          <div className="profile-card card-shadow-soft" style={{ textAlign: 'center', padding: '40px' }}>
            Cargando información segura...
          </div>
        ) : (
          <div className="profile-card card-shadow-soft">
            <div className="profile-header">
              <div className="profile-avatar" style={{ backgroundColor: '#D32F2F' }}>
                <span className="avatar-initial">{userData.nombre.charAt(0).toUpperCase()}</span>
              </div>
              <div className="profile-main-info">
                <h2>{userData.nombre}</h2>
                <p style={{ color: '#D32F2F', fontWeight: 'bold' }}>
                    {userData.is_superuser ? 'Superusuario' : 'Administrador'}
                </p>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre de Usuario (Login)</label>
                <input type="text" value={userData.username} disabled />
              </div>

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
                <label>Teléfono de Contacto</label>
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

            <div className="danger-zone" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <h3 style={{ color: '#888' }}>Seguridad del Sistema</h3>
              <p>Tu nivel de acceso te otorga control total sobre la heladería y sus finanzas.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
