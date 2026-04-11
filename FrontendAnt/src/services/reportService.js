import api from './api';

/**
 * Servicio de Reportes y Dashboard (Vista 5) para Vanelis Cream
 */
const reportService = {
  /**
   * Obtener datos del dashboard administrativo
   * GET /api/reportes/dashboard/
   * 
   * @param {Object} params - Filtros como periodo, anio, mes, umbral_stock, top_limit
   */
  getDashboardData: async (params = {}) => {
    // Valores por defecto aceptados por el backend
    const defaultParams = {
      periodo: 'mes',
      anio: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      umbral_stock: 15,
      top_limit: 5,
      alertas_limit: 5
    };

    const finalParams = { ...defaultParams, ...params };
    
    // Construir query string manualmente para asegurar orden o usar axios params
    const response = await api.get('/api/reportes/dashboard/', { params: finalParams });
    return response.data;
  },

  /**
   * Exportar hoja de despacho (Opcional si existe endpoint)
   */
  getDispatchSheet: async () => {
    // Simulado por ahora si no hay endpoint específico
    return { success: true, message: "Hoja de despacho generada" };
  }
};

export default reportService;
