import api from './api';

/**
 * Servicio de Pedidos Administrativos (Vista 6) para Vanelis Cream
 */
const pedidoService = {
  /**
   * Obtener todos los pedidos
   * GET /api/pedidos/
   * 
   * @param {Object} params - Filtros opcionales (search, estado, fecha_inicio, fecha_fin)
   */
  getAllPedidos: async (params = {}) => {
    try {
      const response = await api.get('/api/pedidos/', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      throw error;
    }
  },

  /**
   * Obtener un pedido específico por ID
   * GET /api/pedidos/<id>/
   */
  getPedidoById: async (id) => {
    try {
      const response = await api.get(`/api/pedidos/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar el estado de un pedido
   * PATCH o PUT /api/pedidos/{id}/estado/ (o endpoint específico)
   * 
   * @param {number} pedidoId
   * @param {number} nuevoEstadoId
   */
  updatePedidoEstado: async (pedidoId, nuevoEstadoId) => {
    try {
      // Corrected endpoint per user request: /api/pedidos/<id>/estado/
      const response = await api.patch(`/api/pedidos/${pedidoId}/estado/`, { estado: nuevoEstadoId });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  /**
   * Obtener lista de estados disponibles (Opcional si es necesario)
   */
  getEstados: async () => {
    try {
      const response = await api.get('/api/pedidos/estados/'); // Asumiendo que existe o simula
      return response.data;
    } catch (error) {
       // Mock fallback if endpoint doesn't exist yet
       return [
         { id: 1, nombre: 'Recibido' },
         { id: 2, nombre: 'Preparando' },
         { id: 3, nombre: 'En camino' },
         { id: 4, nombre: 'Entregado' },
         { id: 5, nombre: 'Cancelado' }
       ];
    }
  }
};

export default pedidoService;
