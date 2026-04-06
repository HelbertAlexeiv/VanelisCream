import api from './api';

const orderService = {
  /**
   * Servicio de Pedidos (RF5) para Vanelis Cream
   */
  /**
   * Crear un nuevo pedido
   * POST /api/pedidos/
   */
  createOrder: async (orderData) => {
    // Expected format: { direccion_entrega, total_pedido, detalles: [...] }
    const response = await api.post('/api/pedidos/', orderData);
    return response.data;
  },

  /**
   * Consultar estado de un pedido (RF7)
   * GET /api/pedidos/pedidos/:id
   */
  getOrderById: async (id) => {
    const response = await api.get(`/api/pedidos/${id}/`);
    return response.data;
  },

  /**
   * Cancelar un pedido (RF6)
   * POST /api/pedidos/pedidos/:id/cancelar
   */
  cancelOrder: async (id) => {
    const response = await api.post(`/api/pedidos/${id}/cancelar/`);
    return response.data;
  },

  /**
   * Obtener pedidos del usuario autenticado
   * GET /api/pedidos/
   */
  getUserOrders: async (params = {}) => {
    const response = await api.get('/api/pedidos/', { params: { ...params, ordering: '-id' } });
    return response.data;
  }
};

export default orderService;
