import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import pedidoService from '../../services/pedidoService';
import productService from '../../services/productService';
import './OrderManagement.css';

const OrderManagement = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // CLEAN SEARCH TERMS: Extract only numbers if it looks like an order code
      const term = searchTerm.trim();
      let apiSearch = "";
      let potentialClientId = undefined;

      if (term) {
        // More robust: search for the first sequence of numbers (e.g. 000001 -> 1)
        const match = term.match(/\d+/);
        apiSearch = match ? match[0].replace(/^0+/, '') || "0" : term;

        // NEW: Try to find a client ID from the current list matching the name
        const clientMatch = orders.find(o => 
          `${o.cliente?.first_name || ''} ${o.cliente?.last_name || ''}`.toLowerCase().includes(term.toLowerCase())
        );
        if (clientMatch?.cliente?.id) potentialClientId = clientMatch.cliente.id;
      }
      
      // MAP STATUS TO ID: Backend usually wants a number (1, 2, 3...)
      const statusMap = {
        'recibido': 1,
        'preparando': 2,
        'en camino': 3,
        'entregado': 4,
        'cancelado': 5
      };

      const params = { 
        page,
        search: potentialClientId ? undefined : (term || undefined), 
        id: (apiSearch && !isNaN(apiSearch)) ? apiSearch : undefined,
        cliente: potentialClientId, 
        estado: statusFilter ? statusMap[statusFilter.toLowerCase()] : undefined,
        fecha_inicio: dateFrom || undefined,
        fecha_fin: dateTo || undefined
      };
      
      let data = null;
      try {
        data = await pedidoService.getAllPedidos(params);
      } catch (e) {
        if (e.response?.status === 404 && page > 1) {
           console.warn("Page out of bounds, resetting to 1");
           return fetchOrders(1);
        }
        throw e;
      }
      
      let newOrders = [];
      let count = 0;
      let next = false;
      let prev = false;

      if (Array.isArray(data)) {
        newOrders = data;
        count = data.length;
      } else {
        newOrders = data.results || [];
        count = data.count || 0;
        next = !!data.next;
        prev = !!data.previous;
      }

      // ULTIMATE RESCUE: If API search returned 0 but apiSearch is a number, try fetching that exact ID
      if (newOrders.length === 0 && apiSearch && !isNaN(apiSearch) && page === 1) {
        try {
          const directMatch = await pedidoService.getPedidoById(parseInt(apiSearch));
          if (directMatch) {
            newOrders = [directMatch];
            count = 1;
            next = false;
            prev = false;
          }
        } catch (e) {
          // No direct ID match found
        }
      }

      // Final Render - Success!
      setOrders(newOrders);
      setTotalOrders(count);
      setHasNext(next);
      setHasPrev(prev);
      
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    // Initial load
    fetchOrders(1);
  }, []); // Only on mount

  // Debounced search trigger
  useEffect(() => {
    if (searchTerm || statusFilter || dateFrom || dateTo) {
      const delayDebounceFn = setTimeout(() => {
        fetchOrders(1);
      }, 500); // Wait 500ms before searching
      return () => clearTimeout(delayDebounceFn);
    } else {
      // If everything cleared, refresh once
      fetchOrders(1);
    }
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const handleRowClick = async (id) => {
    setModalLoading(true);
    try {
      const detail = await pedidoService.getPedidoById(id);
      
      // Hydrate products if they only have IDs
      const detList = detail.detalles || detail.items || detail.pedido_detalles || [];
      if (detList.length > 0) {
        const hydratedDetalles = await Promise.all(
          detList.map(async (item) => {
            try {
              if (item.producto && (!item.nombre_producto || !item.nombre)) {
                const prodId = typeof item.producto === 'object' ? item.producto.id : item.producto;
                const fullProd = await productService.getProductById(prodId);
                return { 
                  ...item, 
                  product_data: fullProd, 
                  nombre_producto: fullProd.nombre // Force the name for the table 
                };
              }
              return item;
            } catch (e) {
              return item;
            }
          })
        );
        detail.detalles = hydratedDetalles;
      }

      setSelectedOrder(detail);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => setSelectedOrder(null);

  // Robust Filtering Logic (Frontend backup + real-time feedback)
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (statusFilter && o.estado?.nombre?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    
    // 2. Dates Filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (new Date(o.fecha_creacion) < fromDate) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(o.fecha_creacion) > toDate) return false;
    }

    // 3. Search Term (ID or Client)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      // Also search for the digits only (clean 'ORDER-000023' -> '23')
      const cleanTerm = term.replace(/order-|ord-|#|0+/g, '');
      
      const idStr = o.id.toString();
      const visualId = `order-${idStr.padStart(6, '0')}`.toLowerCase();
      
      // Inclusion of all possible client identifiers, normalized
      const firstName = (o.cliente?.first_name || "").toLowerCase();
      const lastName = (o.cliente?.last_name || "").toLowerCase();
      const username = (o.cliente?.username || "").toLowerCase();
      const email = (o.cliente?.email || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      
      const matchesId = idStr === cleanTerm || visualId.includes(term) || idStr.includes(term);
      const matchesClient = firstName.includes(term) || 
                            lastName.includes(term) || 
                            fullName.includes(term) || 
                            username.includes(term) || 
                            email.includes(term);
      
      if (!matchesId && !matchesClient) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    // Re-fetch everything
    setTimeout(() => fetchOrders(1), 50);
  };

  const getStatusClass = (statusStr) => {
    if (!statusStr) return '';
    return statusStr.toLowerCase().replace(/\s+/g, '_');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return { d: '-', t: '-' };
    const date = new Date(dateStr);
    const d = date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const t = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { d, t };
  };

  const calculateItems = (detalles) => {
    if (!Array.isArray(detalles)) return 0;
    return detalles.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <AdminLayout>
      <div className="order-management-page">
        {/* Filter Bar */}
        <div className="admin-filter-bar card-shadow-soft">
          <div className="filter-input-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Buscar pedido o cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-input-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-input-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="filter-input-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Estado</option>
              <option value="recibido">Recibido</option>
              <option value="preparando">Preparando</option>
              <option value="en camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="filter-actions-admin">
            <button className="btn-search-admin" onClick={() => fetchOrders(1)}>Buscar</button>
            <button className="btn-clear-admin" onClick={handleClearFilters} title="Limpiar filtros">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Orders Table Area */}
        <div className="orders-table-container">
          {loading ? (
            <div className="dashboard-loading" style={{ height: '200px' }}>
              <div className="spinner"></div>
              <p>Cargando órdenes...</p>
            </div>
          ) : (
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th># Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Cant.</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => {
                    const { d, t } = formatDate(order.fecha_creacion);
                    const realIndex = (currentPage - 1) * 10 + index + 1;
                    return (
                      <tr key={order.id} className="order-row click-row" onClick={() => handleRowClick(order.id)}>
                        <td>{realIndex}</td>
                        <td className="order-id-cell">ORDER-{order.id.toString().padStart(6, '0')}</td>
                        <td className="order-date-cell">
                          {d}
                          <span className="date-sub">{t}</span>
                        </td>
                        <td>
                          {order.cliente?.first_name || ''} {order.cliente?.last_name || ''}
                          {!order.cliente?.first_name && <span className="text-muted">{order.cliente?.username}</span>}
                        </td>
                        <td>{calculateItems(order.detalles)}</td>
                        <td className="order-price-cell">${formatCurrency(order.total_pedido)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.estado?.nombre)}`}>
                            {order.estado?.nombre || 'Desconocido'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                      No se encontraron pedidos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="admin-modal-overlay" onClick={closeModal}>
            <div className="admin-modal-content card-shadow-soft" onClick={(e) => e.stopPropagation()}>
              <button className="btn-close-modal" onClick={closeModal}>×</button>
              
              <div className="modal-header">
                <h3>Detalle de Pedido</h3>
                <span className="order-ref">ORDER-{selectedOrder.id.toString().padStart(6, '0')}</span>
              </div>
              
              <div className="modal-body">
                <div className="modal-section scrollable">
                   <h4>📦 Resumen de Productos</h4>
                   <table className="detail-items-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Unitario</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.detalles?.map((item, id) => (
                           <tr key={id}>
                              <td>{item.nombre_producto || `Producto ${item.producto}`}</td>
                              <td>{item.cantidad}</td>
                              <td>${formatCurrency(item.precio_unitario)}</td>
                              <td>${formatCurrency(item.subtotal)}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                   <div className="detail-order-total">
                      <span>Total General:</span>
                      <strong>${formatCurrency(selectedOrder.total_pedido)}</strong>
                   </div>
                </div>

                <div className="modal-sidebar-info">
                   <div className="info-card">
                      <h4>📍 Entrega</h4>
                      <p>{selectedOrder.direccion_entrega}</p>
                   </div>
                   <div className="info-card">
                      <h4>👤 Cliente</h4>
                      <p><strong>Nombre:</strong> {selectedOrder.cliente?.first_name} {selectedOrder.cliente?.last_name}</p>
                      <p><strong>Usuario:</strong> {selectedOrder.cliente?.username}</p>
                      <p><strong>Tel:</strong> {selectedOrder.cliente?.telefono || 'No registrado'}</p>
                      <p><strong>Email:</strong> {selectedOrder.cliente?.email}</p>
                   </div>
                   <div className="info-card">
                      <h4>⏳ Estado</h4>
                      <span className={`status-badge ${getStatusClass(selectedOrder.estado?.nombre)}`}>
                        {selectedOrder.estado?.nombre}
                      </span>
                   </div>
                </div>
              </div>

              <div className="modal-actions">
                 <button className="btn-modal-action-secondary" onClick={closeModal}>Cerrar</button>
                 <button className="btn-modal-action-primary" onClick={() => window.print()}>🖨️ Imprimir Factura</button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Logic */}
        {!loading && filteredOrders.length > 0 && (
          <div className="admin-pagination">
            <div className="pagination-info">
              Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalOrders)} de {totalOrders} pedidos
            </div>
            <div className="pagination-controls">
              <button 
                className="btn-paging" 
                disabled={!hasPrev} 
                onClick={() => fetchOrders(currentPage - 1)}
              >
                &lt; Anterior
              </button>
              
              {/* Calculate total pages based on 10 items per page */}
              {Array.from({ length: Math.ceil(totalOrders / 10) }, (_, i) => i + 1).map(page => (
                <div 
                  key={page} 
                  className={`page-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => fetchOrders(page)}
                >
                  {page}
                </div>
              ))}

              <button 
                className="btn-paging" 
                disabled={!hasNext} 
                onClick={() => fetchOrders(currentPage + 1)}
              >
                Siguiente &gt;
              </button>
            </div>
          </div>
        )}

        {/* --- PROFESSIONAL PRINTABLE INVOICE (Hidden until print) --- */}
        {selectedOrder && (
          <div className="printable-invoice-container">
            <div className="invoice-header-print">
              <div className="invoice-logo-area">
                <h1>VANELIS CREAM</h1>
                <p>Helados Artesanales Premium</p>
                <p>Bucaramanga, Santander</p>
              </div>
              <div className="invoice-meta-print">
                <h2>FACTURA DE VENTA</h2>
                <p><strong>Ref:</strong> ORDER-{selectedOrder.id.toString().padStart(6, '0')}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedOrder.fecha_creacion).d}</p>
              </div>
            </div>

            <div className="invoice-info-grid">
              <div className="info-block-print">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> {selectedOrder.cliente?.first_name} {selectedOrder.cliente?.last_name}</p>
                <p><strong>Teléfono:</strong> {selectedOrder.cliente?.telefono || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.cliente?.email}</p>
              </div>
              <div className="info-block-print">
                <h3>Información de Entrega</h3>
                <p><strong>Dirección:</strong> {selectedOrder.direccion_entrega}</p>
                <p><strong>Estado:</strong> {selectedOrder.estado?.nombre?.toUpperCase()}</p>
              </div>
            </div>

            <table className="invoice-table-print">
              <thead>
                <tr>
                  <th>Descripción del Producto</th>
                  <th style={{textAlign: 'center'}}>Cant.</th>
                  <th style={{textAlign: 'right'}}>Unitario</th>
                  <th style={{textAlign: 'right'}}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.detalles?.map((item, id) => (
                  <tr key={id}>
                    <td>{item.nombre_producto || `Producto #${item.producto}`}</td>
                    <td style={{textAlign: 'center'}}>{item.cantidad}</td>
                    <td style={{textAlign: 'right'}}>${formatCurrency(item.precio_unitario)}</td>
                    <td style={{textAlign: 'right'}}>${formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals-print">
              <div className="total-line-print">
                <span>Subtotal:</span>
                <span>${formatCurrency(selectedOrder.total_pedido)}</span>
              </div>
              <div className="total-line-print grand-total">
                <span>TOTAL A PAGAR:</span>
                <span>${formatCurrency(selectedOrder.total_pedido)}</span>
              </div>
            </div>

            <div className="invoice-footer-print">
              <p>¡Gracias por elegir Vanelis Cream! Disfruta tu helado.</p>
              <p>Esta es una representación física de tu pedido digital.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
