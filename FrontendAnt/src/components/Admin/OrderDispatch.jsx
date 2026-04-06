import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import pedidoService from '../../services/pedidoService';
import productService from '../../services/productService';
import './OrderDispatch.css';

const OrderDispatch = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all active orders in the dispatch workflow
      // Note: We fetch multiple statuses to ensure persistence until "entregado"
      const data = await pedidoService.getAllPedidos({ 
        // Backend filtering for multiple statuses (if supported) or we handle in frontend
        // Assuming your backend supports a list of IDs or we refine current logic
        ordering: '-id' 
      });
      
      const list = Array.isArray(data) ? data : (data.results || []);
      
      // Filter logically: only those NOT delivered and NOT cancelled
      const activeList = list.filter(order => {
        const status = order.estado?.nombre?.toLowerCase();
        return status === 'recibido' || status === 'preparando' || status === 'en camino';
      });

      setPendingOrders(activeList);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleSelectOrder = async (order) => {
    setDetailLoading(true);
    try {
      const fullDetail = await pedidoService.getPedidoById(order.id);
      
      // Hydrate products if they only have IDs
      const detList = fullDetail.detalles || fullDetail.items || fullDetail.pedido_detalles || [];
      if (detList.length > 0) {
        const hydratedDetalles = await Promise.all(
          detList.map(async (item) => {
            try {
              // Only fetch if product data is missing or incomplete
              if (item.producto && !item.producto.nombre) {
                const prodId = typeof item.producto === 'object' ? item.producto.id : item.producto;
                const fullProd = await productService.getProductById(prodId);
                return { ...item, producto: fullProd };
              }
              return item;
            } catch (e) {
              return item;
            }
          })
        );
        fullDetail.detalles = hydratedDetalles;
      }

      setSelectedOrder(fullDetail);
    } catch (error) {
      console.error("Error loading full order details:", error);
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!selectedOrder) return;

    let nextStatusId = 2; // Default: Recibido -> Preparando
    let nextStatusName = 'preparando';

    if (selectedOrder.estado?.nombre.toLowerCase() === 'preparando') {
      nextStatusId = 3;
      nextStatusName = 'en camino';
    } else if (selectedOrder.estado?.nombre.toLowerCase() === 'en camino') {
      nextStatusId = 4;
      nextStatusName = 'entregado';
    }

    try {
      const updatedStatus = await pedidoService.updatePedidoEstado(selectedOrder.id, nextStatusId);
      
      // Update local state of the active order to reflect the change immediately
      const nextOrderState = {
        ...selectedOrder,
        estado: { 
          id: nextStatusId, 
          nombre: nextStatusName 
        }
      };
      setSelectedOrder(nextOrderState);

      // If it reached "entregado", finish processing and clear
      if (nextStatusName === 'entregado') {
        alert("Pedido entregado correctamente.");
        setSelectedOrder(null);
        fetchPending(); // Refresh list to get next in line
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error al actualizar el estado. Por favor verifica la conexión.");
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "hace poco";
    const mins = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (mins < 1) return "hace unos segundos";
    return `hace ${mins.toString().padStart(2, '0')} min`;
  };

  const calculateTotalItems = (detalles) => {
    if (!detalles) return 0;
    return detalles.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0);
  };

  const getButtonText = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'recibido') return "Marcar como Listo";
    if (s === 'preparando') return "Despachar pedido";
    if (s === 'en camino') return "Confirmar Entrega";
    return "Avanzar Estado";
  };

  return (
    <AdminLayout>
      <div className="dispatch-container">
        
        {/* LEFT COLUMN: Pending Orders List */}
        <section className="dispatch-sidebar card-shadow-soft">
          <div className="sidebar-header">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> Órdenes Pendientes</h3>
          </div>

          <div className="pending-list scrollable">
            {loading ? (
              <div className="dispatch-loading-small">Cargando...</div>
            ) : pendingOrders.length > 0 ? (
              pendingOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`dispatch-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                  onClick={() => handleSelectOrder(order)}
                >
                  <div className="card-top">
                    <span className="order-num">#{order.id.toString().padStart(5, '0')}</span>
                    <span className={`order-status-dot ${order.estado?.nombre?.toLowerCase().replace(/\s+/g, '')}`}></span>
                    <span className="order-time">{getTimeAgo(order.fecha_creacion)}</span>
                    <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                  <div className="card-client">{order.cliente?.first_name} {order.cliente?.last_name || order.cliente?.username}</div>
                  <div className="card-address">{order.direccion_entrega?.split(',')[0]}</div>
                  
                  {/* Icons of products */}
                  <div className="card-icons">
                     <div className="p-icon-stack">
                        {order.detalles?.slice(0, 2).map((_, i) => (
                           <div key={i} className={`p-icon-tiny icon-${i}`}></div>
                        ))}
                     </div>
                     <span className="p-count">{calculateTotalItems(order.detalles)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-dispatch">No hay órdenes pendientes.</div>
            )}
          </div>

          <div className="sidebar-footer">
             <p>{pendingOrders.length} Órdenes pendientes. Última actualización hace {Math.floor((new Date() - lastUpdate)/1000)} segundos.</p>
             <button className="btn-update-dispatch" onClick={fetchPending}>Actualizar</button>
          </div>
        </section>

        {/* RIGHT COLUMN: Active Order Detail */}
        <section className="dispatch-detail card-shadow-soft">
          {detailLoading ? (
            <div className="dispatch-loading-main">
               <div className="spinner-ice"></div>
               <p>Cargando helados...</p>
            </div>
          ) : selectedOrder ? (
            <>
              <div className="detail-header">
                <div className="h-info">
                  <h2>#{selectedOrder.id.toString().padStart(5, '0')} | <span>{getTimeAgo(selectedOrder.fecha_creacion)}</span></h2>
                  <div className="h-client">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    | {selectedOrder.cliente?.first_name} {selectedOrder.cliente?.last_name || selectedOrder.cliente?.username}
                  </div>
                  <div className="h-delivery">Entregar en: {selectedOrder.direccion_entrega}</div>
                </div>
              </div>

              <div className="detail-scroll-area scrollable">
                 <div className="detail-instructions">
                    "Por favor asegurarse que el helado no se derrita."
                 </div>

                 <div className="detail-items-section">
                    <div className="items-list-admin">
                       {/* Triple-redundant check for order items */}
                       {(() => {
                          const items = selectedOrder.detalles || selectedOrder.items || selectedOrder.pedido_detalles || [];
                          if (items.length > 0) {
                            return items.map((item, idx) => {
                              // Multiple fallback for product names and images
                              const productName = item.producto?.nombre || 
                                               item.nombre_producto || 
                                               item.producto_nombre || 
                                               item.nombre || 
                                               `Helado #${item.producto}`;
                              
                              const productImage = item.producto?.imagen || 'https://via.placeholder.com/60?text=Helado';
                              const brandName = typeof item.producto?.marca === 'object' ? item.producto.marca.nombre : (item.producto?.marca || 'Popsy');

                              return (
                                <div className="dispatch-item-row" key={idx}>
                                  <div className="item-visual-column">
                                     <img src={productImage} alt={productName} className="item-mini-img" />
                                  </div>
                                  <div className="item-main">
                                     <div className="item-name">{productName}</div>
                                     <div className="item-brand-badge">{brandName}</div>
                                  </div>
                                  <div className="item-controls">
                                     <div className="check-btn active">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                     </div>
                                     <div className="item-qty-row">
                                        <span className="qty-val">{item.cantidad}</span>
                                        <span className="divider">|</span>
                                        <div className="p-icon-tiny thumb"></div>
                                        <span className="qty-val">{item.cantidad}</span>
                                     </div>
                                   </div>
                                </div>
                              );
                            });
                          } else {
                            return <div className="empty-items-msg" style={{color: 'red', fontWeight: 'bold'}}>No se encontraron detalles de helados para este pedido.</div>;
                          }
                       })()}
                    </div>
                 </div>
              </div>

              {/* FOOTER AREA - ALWAYS VISIBLE */}
              <div className="detail-footer-fixed">
                 <div className="detail-total-bar">
                    <div className="total-qty">
                       <span>Total helados:</span>
                       <strong>{calculateTotalItems(selectedOrder.detalles)}</strong>
                    </div>
                    <div className="total-price">
                       <span>Valor Total:</span>
                       <strong>${parseFloat(selectedOrder.total_pedido || 0).toLocaleString('es-CO')}</strong>
                    </div>
                 </div>

                 <div className="detail-footer-actions">
                    <button className="btn-print-dispatch" onClick={() => window.print()}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19h16"></path><path d="M6 15h12"></path><rect x="6" y="5" width="12" height="10" rx="2"></rect></svg>
                       Hoja Despacho
                    </button>
                    
                    <button className="btn-finish-dispatch" onClick={handleAdvanceStatus}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                       {getButtonText(selectedOrder.estado?.nombre)}
                    </button>
                 </div>
              </div>
            </>
          ) : (
            <div className="detail-empty">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
               <p>Selecciona una orden de la izquierda para comenzar el despacho.</p>
            </div>
          )}
        </section>

        {/* --- PROFESSIONAL PRINTABLE DISPATCH SHEET (Internal) --- */}
        {selectedOrder && (
          <div className="printable-dispatch-container">
            <div className="dispatch-header-print">
               <div className="invoice-logo-area">
                  <h1>VANELIS CREAM</h1>
                  <p>Picking & Packing | Logística Interna</p>
               </div>
               <div className="dispatch-meta-print">
                  <p><strong>Fecha Impresión:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
               </div>
            </div>

            <div className="dispatch-order-box">
               <h2>ORDEN # {selectedOrder.id.toString().padStart(6, '0')}</h2>
               <p><strong>Cliente:</strong> {selectedOrder.cliente?.first_name} {selectedOrder.cliente?.last_name}</p>
               <p><strong>Dirección:</strong> {selectedOrder.direccion_entrega}</p>
            </div>

            <div className="dispatch-instructions-print">
               ⚠️ NOTAS: "Por favor asegurarse que el helado no se derrita."
            </div>

            <table className="dispatch-table-print">
               <thead>
                  <tr>
                     <th style={{width: '60px'}}>PICK</th>
                     <th>PRODUCTO / MARCA</th>
                     <th style={{textAlign: 'center'}}>CANT.</th>
                  </tr>
               </thead>
               <tbody>
                  {(selectedOrder.detalles || []).map((item, id) => (
                    <tr key={id}>
                       <td style={{textAlign: 'center'}}><div className="check-box-print"></div></td>
                       <td>
                          <strong>{item.producto?.nombre || item.nombre_producto || `Helado #${item.producto}`}</strong>
                          <br />
                          <small>{typeof item.producto?.marca === 'object' ? item.producto.marca.nombre : (item.producto?.marca || 'Popsy')}</small>
                       </td>
                       <td style={{textAlign: 'center', fontSize: '1.5rem'}}><strong>{item.cantidad}</strong></td>
                    </tr>
                  ))}
               </tbody>
            </table>

            <div className="dispatch-total-print">
               Total Unidades: {calculateTotalItems(selectedOrder.detalles)}
            </div>

            <div className="dispatch-footer-print">
               <span>Firma Recibido Cliente: ________________________________________________</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderDispatch;
