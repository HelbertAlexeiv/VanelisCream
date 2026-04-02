import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const [isOpen, setIsOpen] = useState(true); // For mobile toggle

  const marcasList = [
    { id: '1', nombre: 'Crem Helado' },
    { id: '2', nombre: 'Popsy' },
    { id: '3', nombre: 'Colombina' },
    { id: '4', nombre: 'Colanta' }
  ];

  const presentacionesList = [
    { id: '1', nombre: 'Paleta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="3" width="10" height="12" rx="4" /><path d="M12 15v6" /></svg> },
    { id: '2', nombre: 'Cono', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 22 4 6 20 6 12 22"></polygon><path d="M6 6c0-3 2.5-4 6-4s6 1 6 4"></path></svg> },
    { id: '3', nombre: 'Galleta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><circle cx="9" cy="9" r="1"></circle><circle cx="15" cy="15" r="1"></circle><circle cx="15" cy="9" r="1"></circle><circle cx="9" cy="15" r="1"></circle></svg> },
    { id: '4', nombre: 'Vasito', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 3 16 21 8 21 5 3"></polygon></svg> },
    { id: '5', nombre: 'Torta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M12 11v-4"></path><path d="M12 3v.01"></path></svg> },
    { id: '6', nombre: 'Combo', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><path d="M12 8v13"></path><path d="M19 12H5"></path><path d="M12 8c-3-3-6-2-6-2v2"></path><path d="M12 8c3-3 6-2 6-2v2"></path></svg> },
    { id: '7', nombre: 'Litro', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 5v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5"></path></svg> },
    { id: '8', nombre: 'Tarrina', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="7" rx="10" ry="3"></ellipse><path d="M2 7l2 11c0 1.66 3.58 3 8 3s8-1.34 8-3l2-11"></path></svg> }
  ];

  const handleMarcaChange = (e) => {
    // Si la API acepta un solo ID de marca a la vez
    const val = e.target.checked ? e.target.value : '';
    onFilterChange({ ...filters, marca: val }); 
  };

  const handleMinPriceChange = (e) => {
    onFilterChange({ ...filters, precio_min: e.target.value });
  };

  const handleMaxPriceChange = (e) => {
    onFilterChange({ ...filters, precio_max: e.target.value });
  };

  const handlePresentacionChange = (id) => {
    onFilterChange({ ...filters, presentacion: id });
  };

  return (
    <>
      <button 
        className="mobile-filter-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Filters"
      >
        <span>Filtros</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
      </button>

      <aside className={`catalog-sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">FILTROS</h2>
        
        {/* MARCA Filter */}
        <div className="filter-group">
          <div className="filter-header">
            <div className="filter-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>
              <span>MARCAS</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
          <div className="filter-options">
            {marcasList.map(marca => (
              <label key={marca.id} className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="marca" 
                  value={marca.id} 
                  onChange={handleMarcaChange}
                  checked={filters.marca === marca.id}
                />
                <span className="checkmark"></span>
                {marca.nombre}
              </label>
            ))}
          </div>
        </div>

        {/* PRECIO Filter */}
        <div className="filter-group">
          <div className="filter-header">
            <div className="filter-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              <span>PRECIO</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
          <div className="filter-options price-range-filter">
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Mín" 
                value={filters.precio_min || ''} 
                onChange={handleMinPriceChange}
                className="price-input"
                min="0"
              />
              <span className="price-separator">-</span>
              <input 
                type="number" 
                placeholder="Máx" 
                value={filters.precio_max || ''} 
                onChange={handleMaxPriceChange}
                className="price-input"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* PRESENTACIÓN Filter */}
        <div className="filter-group">
          <div className="filter-header">
            <div className="filter-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>PRESENTACIÓN</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
          <div className="filter-options presentation-options">
            {presentacionesList.map(pres => (
              <button 
                key={pres.id}
                className="presentation-btn" 
                onClick={() => handlePresentacionChange(pres.id)}
                style={{
                  background: filters.presentacion === pres.id ? 'rgba(211,47,47,0.1)' : 'none',
                  color: filters.presentacion === pres.id ? '#D32F2F' : '#555',
                  fontWeight: filters.presentacion === pres.id ? '600' : 'normal'
                }}
              >
                {pres.icon}
                <span>{pres.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <div style={{ padding: '0 24px', marginTop: '30px' }}>
          <button 
            type="button" 
            onClick={onClearFilters} 
            className="clear-all-filters-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Limpiar Filtros
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
