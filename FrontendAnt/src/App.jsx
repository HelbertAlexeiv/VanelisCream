import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import CatalogPage from './components/Catalog/CatalogPage';
import ProductDetail from './components/Catalog/ProductDetail';
import CartPage from './components/Cart/CartPage';
import OrderTrackingPage from './components/Order/OrderTrackingPage';
import ProfilePage from './components/Profile/ProfilePage';
import { CartProvider } from './context/CartContext';

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
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
