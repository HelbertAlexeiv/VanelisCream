import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delivery Form State
  const [deliveryData, setDeliveryData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    barrio: '',
    telefono: '',
    instrucciones: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top and Load User Profile
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadProfile = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getMe();
          setDeliveryData(prev => ({
            ...prev,
            nombre: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            direccion: user.direccion || '',
            telefono: user.telefono || ''
          }));
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    loadProfile();
  }, []);

  // Handle Search interaction from Header: redirect back to Catalog
  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        navigate('/tienda', { state: { searchInit: searchTerm } });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // Basic validation
    if (!deliveryData.nombre || !deliveryData.direccion || !deliveryData.ciudad || !deliveryData.telefono) {
      alert("Por favor llena todos los campos obligatorios de entrega.");
      return;
    }

    setIsSubmitting(true);
    
    // Combine fields into a single address string for the backend as Pedido model requires
    const fullAddress = `${deliveryData.direccion}, ${deliveryData.barrio ? deliveryData.barrio + ', ' : ''}${deliveryData.ciudad}${deliveryData.instrucciones ? ' (Instrucciones: ' + deliveryData.instrucciones + ')' : ''}`;

    // Construct payload per latest backend findings (PedidoCreateSerializer)
    const payload = {
      direccion_entrega: fullAddress,
      total_pedido: cartTotal,
      detalles: cartItems.map(item => ({
        producto: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio,
        subtotal: item.precio * item.quantity
      }))
    };

    try {
      const response = await orderService.createOrder(payload);
      console.log('Pedido exitoso:', response);
      
      let orderId = response.id;
      
      // FALLBACK: If the response is missing the ID, fetch the user's latest order
      if (!orderId) {
        console.warn("Backend didn't return an order ID. Attempting recovery...");
        try {
          const myOrders = await orderService.getUserOrders({ page_size: 1 });
          const latest = Array.isArray(myOrders) ? myOrders[0] : (myOrders.results ? myOrders.results[0] : null);
          if (latest) {
            orderId = latest.id;
            console.log("Success: Recovered ID", orderId);
          }
        } catch (e) {
          console.error("Failed to recover order ID:", e);
        }
      }

      const orderDetails = {
        id: orderId,
        status: "Recibido",
        direccion_entrega: payload.direccion_entrega,
        items: cartItems.map(item => ({
             ...item,
             cantidad: item.quantity,
             producto_nombre: item.nombre
        })),
        total: cartTotal
      };
      
      clearCart();
      navigate(`/pedido/${orderId || 'error'}`, { state: { orderDetails } });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      const errorMsg = error.response?.data?.detalle || "Hubo un error al procesar el pedido. Inténtalo de nuevo.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-layout">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="cart-main">
        <div className="cart-header">
          <h1 className="cart-title">Carrito de Compras</h1>
          <p className="cart-subtitle">Revisa y gestiona tus helados antes de finalizar tu pedido.</p>
        </div>

        <div className="cart-content-grid">
          
          {/* Left Column: Items and Form */}
          <div className="cart-left-col">
            
            {/* Products Section */}
            <section className="cart-section card-shadow-soft">
              <h2 className="section-heading">Tus Productos</h2>
              
              {cartItems.length === 0 ? (
                <div className="empty-cart-message">
                  <p>No tienes productos en el carrito aún.</p>
                  <button className="back-btn" onClick={() => navigate('/tienda')}>Ver Catálogo</button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div className="cart-item-row" key={item.id}>
                      <div className="item-image-wrapper">
                        <img 
                          src={item.imagen} 
                          alt={item.nombre} 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Helado'; }}
                        />
                      </div>
                      
                      <div className="item-details">
                        <h3 className="item-name">{item.nombre}</h3>
                        <div className="item-meta">
                          {/* Presentacion is mocked since we didn't strictly save it in product detail, but simulated it for fidelity */}
                          <span className="item-presentation">1 Unidad</span>
                          <span className="item-separator">|</span>
                          <span className="item-unit-price">${item.precio.toLocaleString('es-CO')} c/u</span>
                        </div>
                      </div>

                      <div className="item-quantity-control">
                        <button className="qty-btn-small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="qty-value-small">{item.quantity}</span>
                        <button className="qty-btn-small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>

                      <div className="item-total-price">
                        ${(item.precio * item.quantity).toLocaleString('es-CO')}
                      </div>

                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)} aria-label="Eliminar producto">
                         &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Delivery Form Section */}
            <section className="cart-section card-shadow-soft">
              <h2 className="section-heading">Detalles de Entrega</h2>
              <form className="delivery-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row two-cols">
                  <input type="text" name="nombre" placeholder="Nombre Completo" value={deliveryData.nombre} onChange={handleInputChange} required />
                  <input type="text" name="direccion" placeholder="Dirección de Envío" value={deliveryData.direccion} onChange={handleInputChange} required />
                </div>
                <div className="form-row three-cols">
                  <input type="text" name="ciudad" placeholder="Ciudad" value={deliveryData.ciudad} onChange={handleInputChange} required />
                  <input type="text" name="barrio" placeholder="Barrio" value={deliveryData.barrio} onChange={handleInputChange} />
                  <input type="tel" name="telefono" placeholder="Teléfono" value={deliveryData.telefono} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <input type="text" name="instrucciones" placeholder="Instrucciones Adicionales (Opcional)" value={deliveryData.instrucciones} onChange={handleInputChange} className="full-width" />
                </div>
              </form>
            </section>

          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-right-col">
            <section className="summary-card card-shadow-soft">
              <h2 className="section-heading">Resumen de Costos</h2>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${cartSubtotal.toLocaleString('es-CO')}</span>
              </div>
              
              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span className="summary-label">Total</span>
                <span className="summary-value">${cartTotal.toLocaleString('es-CO')}</span>
              </div>

              <button 
                className="confirm-order-btn" 
                onClick={handleConfirmOrder} 
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
