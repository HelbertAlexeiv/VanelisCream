import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import orderService from '../../services/orderService';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrders = async () => {
      try {
        const data = await orderService.getUserOrders();
        const list = Array.isArray(data) ? data : (data.results || []);
        setOrders(list);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'recibido') return 'status-received';
    if (s === 'preparando') return 'status-preparing';
    if (s === 'en camino') return 'status-shipping';
    if (s === 'entregado') return 'status-delivered';
    if (s === 'cancelado') return 'status-cancelled';
    return '';
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('es-CO', options);
  };

  return (
    <div className="orders-layout">
      <Header />

      <main className="orders-main">
        <header className="orders-header">
          <h1 className="orders-title">Mis Pedidos</h1>
          <p className="orders-subtitle">Aquí puedes ver el historial de tus helados y seguir tus pedidos activos.</p>
        </header>

        {loading ? (
          <div className="orders-loading card-shadow-soft">
            <div className="spinner"></div>
            <p>Cargando tus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty card-shadow-soft">
            <div className="empty-icon">🍦</div>
            <h2>Aún no tienes pedidos</h2>
            <p>Parece que aún no has probado nuestros deliciosos helados.</p>
            <button className="go-tienda-btn" onClick={() => navigate('/tienda')}>Ir a la Tienda</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card card-shadow-soft" key={order.id}>
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-id-label">Pedido</span>
                    <span className="order-id-value">#ORDER-{order.id}</span>
                  </div>
                  <span className={`order-status-badge ${getStatusClass(order.estado?.nombre || order.status)}`}>
                    {order.estado?.nombre || order.status || 'Recibido'}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-meta-info">
                    <p className="order-date"><strong>Fecha:</strong> {formatDate(order.fecha_creacion)}</p>
                    <p className="order-address"><strong>Entrega:</strong> {order.direccion_entrega}</p>
                    <p className="order-total"><strong>Total:</strong> ${(parseFloat(order.total_pedido || order.total || 0)).toLocaleString('es-CO')}</p>
                  </div>
                  
                  <div className="order-preview-items">
                    {(order.items || order.detalles)?.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="preview-tag">
                        {item.producto_nombre || item.nombre || `Producto #${item.producto}`}
                      </span>
                    ))}
                    {(order.items || order.detalles)?.length > 3 && <span className="preview-more">...</span>}
                  </div>
                </div>

                <div className="order-card-actions">
                  <button 
                    className="track-btn" 
                    onClick={() => navigate(`/pedido/${order.id}`)}
                  >
                    Hacer Seguimiento
                  </button>
                  <button className="details-btn-text" onClick={() => navigate(`/pedido/${order.id}`)}>
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
