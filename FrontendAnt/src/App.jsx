import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './components/Auth/AuthPage';
import CatalogPage from './components/Catalog/CatalogPage';
import ProductDetail from './components/Catalog/ProductDetail';
import CartPage from './components/Cart/CartPage';
import OrderTrackingPage from './components/Order/OrderTrackingPage';
import ProfilePage from './components/Profile/ProfilePage';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProfile from './components/Admin/AdminProfile';
import OrderManagement from './components/Admin/OrderManagement';
import OrderDispatch from './components/Admin/OrderDispatch';
import MyOrdersPage from './components/Order/MyOrdersPage';
import { CartProvider } from './context/CartContext';
import authService from './services/authService';

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const user = await authService.getMe();
        // Verificamos de forma robusta si es administrador
        const checkResult = user.is_staff || 
                             user.is_superuser || 
                             user.rol?.nombre?.toLowerCase() === 'administrador';
        setIsAdmin(checkResult);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [isAuthenticated]);

  if (isAdmin === null) return <div className="loading-screen">Verificando permisos...</div>;
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/tienda" />;
};

function App() {
  return (
    <CartProvider>
      <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/tienda" element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/pedido/:id" element={<OrderTrackingPage />} />
        <Route path="/mis-pedidos" element={<MyOrdersPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        
        {/* Rutas Administrativas Protegidas */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/perfil" 
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/pedidos" 
          element={
            <AdminRoute>
              <OrderManagement />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/despacho" 
          element={
            <AdminRoute>
              <OrderDispatch />
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
