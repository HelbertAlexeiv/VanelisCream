import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import orderService from '../../services/orderService';
import './OrderTrackingPage.css';

const ORDER_STEPS = ["Recibido", "Preparando", "En camino", "Entregado", "Cancelado"];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Timer state (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [isCancelled, setIsCancelled] = useState(false);

  // Load Initial Order
  useEffect(() => {
    const fetchOrder = async () => {
      window.scrollTo(0, 0);
      try {
        let data;
        if (location.state && location.state.orderDetails) {
          data = location.state.orderDetails;
        } else {
          data = await orderService.getOrderById(id);
        }
        
        setOrder(data);
        
        // Find index of current status
        const stepIdx = ORDER_STEPS.indexOf(data.status);
        setCurrentStepIndex(stepIdx !== -1 ? stepIdx : 0);
        
        if (data.status === 'Cancelado') {
          setIsCancelled(true);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Polling simulation for order progress (RF7)
  useEffect(() => {
    if (loading || isCancelled || currentStepIndex >= 3) return; // Stop if cancelled or delivered

    const pollInterval = setInterval(() => {
      // En una implementación real, harías: const data = await orderService.getOrderById(id); setOrder(data);
      // Aqui simulamos que el restaurante avanza el pedido cada 15 segundos para propósitos de demostración al cliente.
      setCurrentStepIndex(prev => {
        const nextStep = prev + 1;
        if (nextStep < 4) {
          return nextStep;
        }
        clearInterval(pollInterval);
        return prev;
      });
    }, 15000); // Avanza un paso cada 15 segundos simulado

    return () => clearInterval(pollInterval);
  }, [loading, isCancelled, currentStepIndex]);

  // Handle countdown timer 
  useEffect(() => {
    if (timeLeft <= 0 || isCancelled || currentStepIndex >= 1) return; // Stop timer if cancelled, reaches 0, or if order is past "Recibido"

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
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
          <h2 className="order-number-title">Número de Pedido: <span>#ORDER-{id}</span></h2>
          
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
              {order.items?.map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <span className="o-item-name">{item.nombre} x {item.cantidad}</span>
                  <span className="o-item-price">${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>

            <div className="tracking-divider"></div>

            <div className="order-subtotal-row">
              <span className="o-label">Subtotal:</span>
              <span className="o-value">${order.subtotal?.toLocaleString('es-CO') || order.total?.toLocaleString('es-CO')}</span>
            </div>
            <div className="order-total-row">
              <span className="o-label">Total:</span>
              <span className="o-value-total">${order.total?.toLocaleString('es-CO')}</span>
            </div>
          </section>

          {/* Delivery Card */}
          <section className="delivery-details-card card-shadow-soft">
            <h3 className="tracking-section-title">Detalles de Entrega</h3>
            <div className="delivery-details-list">
              <p><strong>Nombre Completo:</strong> {order.cliente_info?.nombre}</p>
              <p><strong>Dirección de Envío:</strong> {order.cliente_info?.direccion}</p>
              <p><strong>Ciudad:</strong> {order.cliente_info?.ciudad}</p>
              <p><strong>Teléfono:</strong> {order.cliente_info?.telefono}</p>
              {order.cliente_info?.instrucciones && (
                <p><strong>Instrucciones:</strong> {order.cliente_info.instrucciones}</p>
              )}
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
            <button className="nav-btn text" onClick={() => {/* Iría a historial de compras */}}>Ver mis Pedidos</button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
