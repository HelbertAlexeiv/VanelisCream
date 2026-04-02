import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      setLoadingRelated(true);
      window.scrollTo(0, 0); // Reset scroll position when loading a new product

      try {
        // Fetch principal product
        const productData = await productService.getProductById(id);
        setProduct(productData);
        setLoading(false);

        // Fetch related products (RF3) by brand
        if (productData?.marca?.id) {
          try {
            const relatedData = await productService.getProducts({ marca: productData.marca.id, page_size: 4 });
            // Filter out the current product from related
            const filteredRelated = (relatedData.results || []).filter(p => p.id !== productData.id).slice(0, 3);
            setRelatedProducts(filteredRelated);
          } catch (relatedErr) {
             console.error('Error fetching related products:', relatedErr);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
        setLoadingRelated(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  // Handle Search interaction from Header: redirect back to Catalog
  useEffect(() => {
    if (searchTerm) {
      // In a real scenario we'd pass state to the router or rely on global state.
      // For this isolated view, logging the behavior and letting the parent catalog component handle its own state is cleaner, 
      // but to simulate immediate search interaction we jump to `/tienda` with a generic redirect if desired.
      // Here we just navigate back to store if user type to search.
      const timer = setTimeout(() => {
        navigate('/tienda', { state: { searchInit: searchTerm } });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, navigate]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="product-detail-layout">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <main className="detail-main loading">
          <div className="spinner-store"></div>
          <p>Cargando información del producto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-layout">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <main className="detail-main empty">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate('/tienda')} className="back-to-store-btn">Volver a la Tienda</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-layout">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="detail-main">
        <div className="detail-container card-shadow">
          <div className="detail-top-content">
            
            {/* Left Column: Image */}
            <div className="detail-image-col">
              <div className="detail-image-wrapper">
                <img 
                  src={product.imagen} 
                  alt={product.nombre} 
                  className="main-product-image"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Helado'; }}
                />
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="detail-info-col">
              <div className="info-header">
                <h1 className="product-title">{product.nombre}</h1>
                <span className="product-price-large">${product.precio?.toLocaleString('es-CO')}</span>
              </div>

              <div className="brand-and-stock">
                <div className="brand-info">
                  <div className="brand-logo-placeholder">
                    {/* Simulated logo for Crem Helado or brand name */}
                    <span className="simulated-logo">{product.marca?.nombre}</span>
                  </div>
                  <span className="brand-label">Marca: <span className="brand-name">{product.marca?.nombre}</span></span>
                </div>
                {product.stock > 0 && (
                  <p className="stock-info">Stock disponible: {product.stock} unidades</p>
                )}
              </div>

              <div className="product-description-section">
                <h3 className="section-subtitle">Descripción Técnica</h3>
                <p className="product-description-text">
                  {product.descripcion || "Un delicioso helado preparado con los mejores ingredientes para brindar una experiencia única."}
                </p>
              </div>

              <div className="purchase-actions">
                <div className="quantity-selector">
                  <button className="qty-btn" onClick={handleDecrement} aria-label="Decrease quantity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={handleIncrement} aria-label="Increase quantity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>

                <button 
                  className="add-to-cart-action-btn"
                  onClick={() => {
                    addToCart(product, quantity);
                    alert(`¡${quantity} x ${product.nombre} agregado al carrito!`);
                  }}
                >
                  <span>Agregar al Carrito</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Section: Related Products */}
          {!loadingRelated && relatedProducts.length > 0 && (
            <div className="related-products-section">
              <h3 className="related-title">Productos Relacionados de {product.marca?.nombre}</h3>
              
              <div className="related-grid">
                {relatedProducts.map((relProduct) => (
                  <div className="related-card" key={relProduct.id} onClick={() => navigate(`/producto/${relProduct.id}`)}>
                    <div className="related-img-container">
                      <img 
                        src={relProduct.imagen} 
                        alt={relProduct.nombre} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150x150?text=Helado'; }}
                      />
                    </div>
                    <div className="related-info">
                       <span className="related-brand-tag">{relProduct.marca?.nombre}</span>
                       <span className="related-name">{relProduct.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
