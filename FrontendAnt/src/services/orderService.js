import api from './api';

/**
 * Servicio de Pedidos (RF5) para Vanelis Cream
 */
const orderService = {
  /**
   * Crear un nuevo pedido
   * POST /api/pedidos/pedidos
   * 
   * @param {Object} orderData Payload con info del cliente e items
   * Expected format:
   * { 
   *   "cliente_info": { "nombre": "...", "direccion": "...", "ciudad": "...", "barrio": "...", "telefono": "..." }, 
   *   "items": [ { "producto_id": 89, "cantidad": 1 } ], 
   *   "total": 50000 
   * }
   */
  createOrder: async (orderData) => {
    const response = await api.post('/api/pedidos/pedidos', orderData);
    return response.data;
  },

  /**
   * Consultar estado de un pedido (RF7)
   * GET /api/pedidos/pedidos/:id
   */
  getOrderById: async (id) => {
    const response = await api.get(`/api/pedidos/pedidos/${id}`);
    return response.data;
  },

  /**
   * Cancelar un pedido (RF6)
   * POST /api/pedidos/pedidos/:id/cancelar
   */
  cancelOrder: async (id) => {
    const response = await api.post(`/api/pedidos/pedidos/${id}/cancelar`);
    return response.data;
  }
};

export default orderService;
