import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ producto }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = () => {
    navigate(`/producto/${producto.id}`);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {/* Etiqueta de marca flotante */}
        {producto.marca?.nombre && (
          <div className="brand-badge">
            <span className="brand-text">{producto.marca.nombre}</span>
          </div>
        )}
        
        <img 
          src={producto.imagen} 
          alt={producto.nombre} 
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x250?text=Helado'; // Fallback
          }}
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name" onClick={handleCardClick} style={{ cursor: 'pointer' }}>{producto.nombre}</h3>
        <p className="product-price">
          ${producto.precio.toLocaleString('es-CO')}
        </p>
        
        <button 
          className="add-to-cart-btn" 
          aria-label={`Agregar ${producto.nombre} al carrito`}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(producto, 1);
            alert(`¡${producto.nombre} agregado al carrito!`);
          }}
        >
          <span>Agregar</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
