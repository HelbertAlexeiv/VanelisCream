import api from './api';

/**
 * Servicio de productos para Vanelis Cream
 * RF3 - Catálogo de productos
 */
const productService = {
  /**
   * Obtener lista de productos con filtros y paginación
   * GET /api/catalogo/productos
   * 
   * @param {Object} params - Parámetros de consulta
   * @param {string} [params.search] - Término de búsqueda
   * @param {string} [params.marca] - Filtro por marca
   * @param {string} [params.presentacion] - Filtro por presentación
   * @param {number} [params.precio_min] - Precio mínimo
   * @param {number} [params.precio_max] - Precio máximo
   * @param {number} [params.stock_gt] - Stock mayor a
   * @param {string} [params.ordering] - Ordenamiento (ej: 'precio', '-precio')
   * @param {number} [params.page] - Número de página
   * @param {number} [params.page_size] - Tamaño de página
   * @returns {Promise<{count, next, previous, results}>}
   */
  getProducts: async (params = {}) => {
    // Limpiar parámetros vacíos
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    });

    const response = await api.get('/api/catalogo/productos', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Obtener detalle de un producto
   * GET /api/catalogo/productos/:id
   */
  getProductById: async (id) => {
    const response = await api.get(`/api/catalogo/productos/${id}`);
    return response.data;
  },
};

export default productService;
