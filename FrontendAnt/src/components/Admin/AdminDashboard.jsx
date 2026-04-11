import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import reportService from '../../services/reportService';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#D32F2F', '#FBC02D', '#1976D2', '#388E3C', '#7B1FA2'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const API_BASE = 'http://localhost:8000';
  const [period, setPeriod] = useState('dia'); // dia, semana, mes (labels in buttons are capitalized)
  const [activeTab, setActiveTab] = useState('Dashboard'); // Current view

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard stats
      const result = await reportService.getDashboardData({ periodo: period });
      
      // 2. Fetch ALL orders to calculate REAL pending (sync with Dispatch view)
      // Note: We fetch a larger page size or handle filtering to match Dispatch logic
      const pendingRes = await api.get('/api/pedidos/', { params: { page_size: 100 } });
      const allOrders = Array.isArray(pendingRes.data) ? pendingRes.data : (pendingRes.data.results || []);
      
      // APPLY SAME FILTER AS ORDERDISPATCH.JSX
      const realPendingCount = allOrders.filter(order => {
        const status = order.estado?.nombre?.toLowerCase();
        return status === 'recibido' || status === 'preparando' || status === 'en camino';
      }).length;
      
      setData({
        ...result,
        resumen: {
          ...result.resumen,
          pedidos_pendientes_real: realPendingCount
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Preparando reporte administrativo...</p>
        </div>
      </AdminLayout>
    );
  }

  // Mapping data from API to Recharts format
  const brandData = data?.distribucion_marcas?.map(item => ({
    name: item.marca,
    value: item.porcentaje
  })) || [
    { name: 'Crem Helado', value: 45 },
    { name: 'Popsy', value: 30 },
    { name: 'Colombina', value: 25 }
  ];

  const incomeData = data?.ingresos?.etiquetas.map((label, i) => ({
    name: label,
    value: data.ingresos.valores[i]
  })) || [
    { name: '1', value: 400 },
    { name: '3', value: 600 },
    { name: '4', value: 500 },
    { name: '7', value: 800 },
    { name: '10', value: 700 },
    { name: '15', value: 1000 },
    { name: '14', value: 900 },
    { name: '17', value: 800 },
    { name: '25', value: 1200 },
    { name: '25', value: 1100 },
    { name: '25', value: 1000 },
    { name: '30', value: 1400 },
  ];

  // Utility to handle both local media paths and external URLs
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}/media/${path}`;
  };

  return (
    <AdminLayout>
      <div className="dashboard-page">
        
        {/* Top Stat Cards Section */}
        <section className="stats-grid">
           <div className="stat-card red-gradient-card card-shadow-soft">
              <div className="stat-icon-wrapper">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Ventas del Mes</span>
                <h2 className="stat-value">${data?.resumen?.ventas_mes.toLocaleString('es-CO') || '28.450.000'}</h2>
              </div>
           </div>

           <div className="stat-card red-gradient-card-alt card-shadow-soft">
              <div className="stat-icon-wrapper">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Pedidos del Día</span>
                <h2 className="stat-value">{data?.resumen?.pedidos_dia || 52}</h2>
              </div>
           </div>

            <div className="stat-card warning-card card-shadow-soft" onClick={() => navigate('/despacho')} style={{ cursor: 'pointer' }}>
               <div className="stat-icon-wrapper">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
               </div>
               <div className="stat-content">
                 <span className="stat-label">Pedidos Pendientes</span>
                 <h2 className="stat-value">{data?.resumen?.pedidos_pendientes_real ?? data?.resumen?.pedidos_pendientes ?? '...'}</h2>
               </div>
            </div>
        </section>

        {/* Middle Charts Section */}
        <section className="charts-main-row">
           {/* Left: Distribution by Brand */}
           <div className="chart-card brand-distribution card-shadow-soft">
              <h3 className="chart-header-title">Distribución por Marcas</h3>
              <div className="pie-container">
                 <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                       <Pie
                          data={brandData}
                          innerRadius={0}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={2}
                          label={({ name, value }) => `${value}%`}
                       >
                          {brandData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="pie-legend-custom">
                    {brandData.map((entry, index) => (
                      <div className="legend-item" key={index}>
                         <div className="legend-item-left">
                            <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="l-name">{entry.name}</span>
                         </div>
                         <span className="l-val">{entry.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Income Chart with Period filters */}
           <div className="chart-card income-history card-shadow-soft">
              <div className="income-header">
                 <h3 className="chart-header-title">Ingresos</h3>
                 <div className="chart-filters">
                    <div className="period-toggles">
                       <button className={period === 'dia' ? 'active' : ''} onClick={() => setPeriod('dia')}>Día</button>
                       <button className={period === 'semana' ? 'active' : ''} onClick={() => setPeriod('semana')}>Semana</button>
                       <button className={period === 'mes' ? 'active' : ''} onClick={() => setPeriod('mes')}>Mes</button>
                    </div>
                    <div className="month-selector">
                       Abril 2026 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                 </div>
              </div>

              <div className="area-container">
                 <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={incomeData}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#7d6e65', fontSize: 12 }} 
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#7d6e65', fontSize: 12 }} 
                          tickFormatter={(v) => `$${v.toLocaleString()}`}
                       />
                       <Tooltip 
                          formatter={(v) => `$${v.toLocaleString()}`}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#D32F2F" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorVal)" 
                          dot={{ r: 4, fill: '#D32F2F', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </section>

        {/* Bottom Lists Section */}
        <section className="lists-row">
           {/* Top Sellers */}
           <div className="list-card top-sellers-list card-shadow-soft">
              <h3 className="section-title">Top Sellers</h3>
              <div className="scrollable-list">
                 {(data?.top_sellers || [
                    { producto: 'Helado Vainilla Brownie', marca: 'Popsy', cantidad_vendida: 920 },
                    { producto: 'Crem Helado Choco', marca: 'Popsy', cantidad_vendida: 850 },
                    { producto: 'Bombón Colombina', marca: 'Colombina', cantidad_vendida: 740 },
                    { producto: 'Helado Fresa Popsy', marca: 'Popsy', cantidad_vendida: 655 },
                 ]).map((item, i) => (
                    <div className="list-item" key={i}>
                       <div className="item-thumb">
                          <img 
                            src={getImageUrl(item.imagen) || `https://via.placeholder.com/80x80?text=Helado+${i+1}`} 
                            alt={item.producto} 
                          />
                       </div>
                       <div className="item-info">
                          <h4>{item.producto}</h4>
                          <span className="item-brand">({item.marca})</span>
                       </div>
                       <div className="item-count">{item.cantidad_vendida || 0}</div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Inventory Alerts */}
           <div className="list-card alerts-list card-shadow-soft">
              <div className="alerts-header">
                <h3 className="section-title">Alertas</h3>
                <button className="view-more-link">Ver más &gt;</button>
              </div>
              <div className="scrollable-list">
                 {(data?.alertas || [
                    { producto: 'Helado Choco - 100ml', stock: 10 },
                 ]).map((alert, i) => (
                    <div className="list-item alert-item" key={i}>
                       <div className="item-thumb">
                          <img 
                            src={getImageUrl(alert.imagen) || `https://via.placeholder.com/80x80?text=Alert`} 
                            alt="Alert" 
                          />
                       </div>
                       <div className="item-info">
                          <h4>{alert.producto}</h4>
                          <span className="item-status">{alert.stock} unidades en stock</span>
                       </div>
                       <div className="alert-action-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red"><path d="M22 17.002a6.002 6.002 0 0 1-11.713 1.861L2.243 10.816a1.002 1.002 0 0 1 0-1.414l6.364-6.364a1.002 1.002 0 0 1 1.414 0l11.713 11.644c.174.174.266.406.266.636a1.004 1.004 0 0 1-1.004 1.004l-6.914.076a4 4 0 1 0 7.925 0l.006.004Z"></path></svg>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
