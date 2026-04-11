import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import './OrderTrackingPage.css';

const ORDER_STEPS = ["Recibido", "Preparando", "En camino", "Entregado", "Cancelado"];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Dynamic timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);

  // Helper to calculate time from cancellation limit
  const calculateTimeRemaining = (limitStr) => {
    if (!limitStr) return null;
    const limit = new Date(limitStr);
    const now = new Date();
    const diff = Math.floor((limit.getTime() - now.getTime()) / 1000);
    return Math.max(0, diff);
  };

  // Load Initial Order
  useEffect(() => {
    const fetchOrder = async () => {
      window.scrollTo(0, 0);
      try {
        let data;
        let effectiveId = id;
        
        // Handle "undefined" ID from malformed navigation
        if (!effectiveId || effectiveId === 'undefined') {
          if (location.state?.orderDetails?.id) {
            effectiveId = location.state.orderDetails.id;
          } else {
            // If still no ID, we can't fetch. Error state.
            setLoading(false);
            return;
          }
        }

        data = await orderService.getOrderById(effectiveId);
        const orderData = data;
        
        // HYDRATION: Fetch full product details for each item
        const itemsToHydrate = orderData.detalles || orderData.items || [];
        const hydratedItems = await Promise.all(
          itemsToHydrate.map(async (item) => {
            try {
              const pId = item.producto_id || item.producto;
              if (!pId) return item;
              const pData = await productService.getProductById(pId);
              return {
                ...item,
                producto_nombre: pData.nombre,
                producto_imagen: pData.imagen,
                producto_marca: pData.marca?.nombre,
                // Fallback for names if already present or cache
                nombre: pData.nombre
              };
            } catch (e) {
              console.warn("Could not hydrate item:", item.producto);
              return item;
            }
          })
        );
        
        const finalOrder = { ...orderData, items: hydratedItems };
        setOrder(finalOrder);
        
        // Calculate dynamic time from backend limit
        const remaining = calculateTimeRemaining(finalOrder.fecha_limite_cancelacion);
        if (remaining !== null) setTimeLeft(remaining);
        
        // Find index of current status (case-insensitive)
        const statusName = (finalOrder.estado?.nombre || finalOrder.status || '').toLowerCase();
        const stepIdx = ORDER_STEPS.findIndex(s => s.toLowerCase() === statusName);
        setCurrentStepIndex(stepIdx !== -1 ? stepIdx : 0);
        
        if (statusName === 'cancelado') {
          setIsCancelled(true);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, location.state]);

  // Polling for real-time manual updates from backend
  useEffect(() => {
    const effectiveId = (id && id !== 'undefined') ? id : order?.id;
    if (loading || isCancelled || currentStepIndex >= 3 || !effectiveId) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await orderService.getOrderById(effectiveId);
        setOrder(data);
        
        const statusName = (data.estado?.nombre || data.status || '').toLowerCase();
        const stepIdx = ORDER_STEPS.findIndex(s => s.toLowerCase() === statusName);
        setCurrentStepIndex(stepIdx !== -1 ? stepIdx : 0);
        
        if (statusName === 'entregado' || statusName === 'cancelado') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 8000); // Poll every 8 seconds for real-time responsiveness

    return () => clearInterval(pollInterval);
  }, [loading, isCancelled, currentStepIndex, id, order?.id]);

  // Handle countdown timer 
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isCancelled || currentStepIndex >= 1) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCancelled, currentStepIndex]);

  const handleCancelOrder = async () => {
    if (window.confirm("¿Estás seguro que deseas cancelar tu pedido?")) {
      try {
        await orderService.cancelOrder(id);
        setIsCancelled(true);
        setCurrentStepIndex(4); // Move to 'Cancelado'
        alert("Tu pedido ha sido cancelado.");
      } catch (error) {
        alert("Ocurrió un error al intentar cancelar. Contacta soporte.");
      }
    }
  };

  // Formatting Time Left MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="tracking-layout">
        <Header />
        <main className="tracking-main center-content">
          <p>Buscando orden #{id}...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-layout">
        <Header />
        <main className="tracking-main center-content">
          <h2>Orden no encontrada</h2>
          <button onClick={() => navigate('/tienda')} className="back-btn">Ir a Tienda</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="tracking-layout">
      <Header />

      <main className="tracking-main">
        {/* Title Section */}
        <section className="tracking-header-section">
          <h1 className="tracking-title">
            {isCancelled ? "Pedido Cancelado" : "¡Gracias por tu pedido!"}
          </h1>
          <p className="tracking-subtitle">
            {isCancelled 
              ? "Tu orden ha sido anulada exitosamente." 
              : "Tu orden ha sido confirmada y está en proceso."}
          </p>
        </section>

        {/* Stepper Card */}
        <section className="stepper-card card-shadow-soft">
          <h2 className="order-number-title">
            Número de Pedido: <span>#ORDER-{order?.id || order?.pk || id || "Cargando..."}</span>
          </h2>
          
          <div className="stepper-container">
            {/* Background Line */}
            <div className="stepper-line-bg"></div>
            {/* Active Green Line */}
            <div 
              className="stepper-line-active" 
              style={{ width: `${isCancelled ? 0 : (currentStepIndex / 3) * 100}%` }}
            ></div>

            {/* Stepper Steps (First 4 normal steps) */}
            {[
              { label: "Recibido", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> },
              { label: "Preparando", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21A10 10 0 0 0 21 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a10 10 0 0 0 10 10Z"></path><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path><path d="M12 3v18"></path></svg> },
              { label: "En camino", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
              { label: "Entregado", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M12 8v12"></path><path d="M8 8V6a4 4 0 0 1 8 0v2"></path><path d="M12 12h.01"></path></svg> }
            ].map((step, idx) => {
              const isActiveLocal = currentStepIndex >= idx && !isCancelled;
              const isCurrentLocal = currentStepIndex === idx && !isCancelled;
              
              return (
                <div className={`stepper-step ${isActiveLocal ? 'active' : ''} ${isCurrentLocal ? 'current' : ''}`} key={idx}>
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  <span className="step-label">{step.label}</span>
                  {isCurrentLocal && idx === 1 && (
                    <span className="step-helper-text">Tu pedido se está preparando con cuidado.</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Info Grid (Summary & Delivery) */}
        {/* We use the same layout style from Cart but split the details */}
        <div className="tracking-info-grid">
          
          {/* Summary Card */}
          <section className="summary-details-card card-shadow-soft">
            <h3 className="tracking-section-title">Resumen de la Orden</h3>
            
            <div className="order-items-list">
              {(order.items || order.detalles)?.map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <div className="o-item-img-mini">
                    <img src={item.producto_imagen || 'https://via.placeholder.com/50x50?text=Helado'} alt={item.producto_nombre} />
                  </div>
                  <div className="o-item-info">
                    <div className="o-item-header">
                      <span className="o-item-name">{item.producto_nombre || item.nombre || `Producto #${item.producto}`}</span>
                      <span className="o-item-qty">x{item.cantidad}</span>
                    </div>
                    {item.producto_marca && <span className="o-item-brand">{item.producto_marca}</span>}
                  </div>
                  <span className="o-item-price">${(parseFloat(item.precio_unitario || item.precio || 0) * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>

            <div className="tracking-divider"></div>

            <div className="order-subtotal-row">
              <span className="o-label">Subtotal:</span>
              <span className="o-value">${(parseFloat(order.subtotal || order.total_pedido || order.total || 0)).toLocaleString('es-CO')}</span>
            </div>
            <div className="order-total-row">
              <span className="o-label">Total:</span>
              <span className="o-value-total">${(parseFloat(order.total_pedido || order.total || 0)).toLocaleString('es-CO')}</span>
            </div>
          </section>

          {/* Delivery Card */}
          <section className="delivery-details-card card-shadow-soft">
            <h3 className="tracking-section-title">Detalles de Entrega</h3>
            <div className="delivery-details-list">
              {order.direccion_entrega ? (
                <p><strong>Dirección de Envío:</strong> {order.direccion_entrega}</p>
              ) : (
                <>
                  <p><strong>Nombre Completo:</strong> {order.cliente_info?.nombre}</p>
                  <p><strong>Dirección de Envío:</strong> {order.cliente_info?.direccion}</p>
                  <p><strong>Ciudad:</strong> {order.cliente_info?.ciudad}</p>
                </>
              )}
              {order.cliente_info?.telefono && <p><strong>Teléfono:</strong> {order.cliente_info?.telefono}</p>}
            </div>
          </section>
        </div>

        {/* Action Controls Footer */}
        <div className="tracking-controls-footer card-shadow-soft">
          <div className="cancel-timer-group">
            <span className="timer-label">Tiempo límite para<br/>cancelar:</span>
            <div className="timer-display">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8 22 22 2 22 2 8 12 2"></polygon><path d="M2.06 16.7L12 11.2l9.94 5.5"></path><path d="M12 22V11.2"></path><path d="M12 2v9.2"></path></svg>
              <div className="timer-text-group">
                <span className="timer-digits">{formatTime(timeLeft)}</span>
                <span className="timer-mm-ss">MM:SS</span>
              </div>
            </div>
            <button 
              className="cancel-order-btn" 
              onClick={handleCancelOrder}
              disabled={timeLeft === 0 || isCancelled || currentStepIndex >= 1}
            >
              Cancelar pedido
            </button>
          </div>

          <div className="navigation-group">
            <button className="nav-btn primary" onClick={() => navigate('/tienda')}>Volver al Inicio</button>
            <button className="nav-btn text" onClick={() => navigate('/mis-pedidos')}>Ver mis Pedidos</button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
