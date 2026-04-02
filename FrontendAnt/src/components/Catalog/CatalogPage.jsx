import { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import Sidebar from './Sidebar';
import ProductCard from './ProductCard';
import productService from '../../services/productService';
import './CatalogPage.css';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // API Query Params State
  const [filters, setFilters] = useState({
    q: '',
    marca: '',
    presentacion: '',
    precio_min: '',
    precio_max: '',
    stock_gt: '',
    ordering: '',
    page: 1,
    page_size: 12,
  });

  // RF3: Cargar catálogo de productos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts(filters);
        // data.results contiene el array de productos paginado según el formato de la API
        setProducts(data.results || []);
      } catch (error) {
        console.error('Error al cargar productos', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]); // Vuelve a cargar si los filtros cambian

  // Sincronizar la barra de búsqueda del Header con los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchTerm, page: 1 }));
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  return (
    <div className="catalog-layout">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="catalog-main">
        <Sidebar 
          className="catalog-sidebar-area" 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={() => {
            setSearchTerm('');
            setFilters({ q: '', marca: '', presentacion: '', precio_min: '', precio_max: '', stock_gt: '', ordering: '', page: 1, page_size: 12 });
          }}
        />
        
        <div className="catalog-content">
          {/* Grid de Productos */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner-store"></div>
              <p>Cargando deliciosos helados...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} producto={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              <h3>No encontramos helados con esos filtros</h3>
              <p>Intenta buscar otra cosa o limpia los filtros.</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ q: '', page: 1, page_size: 12 });
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;
