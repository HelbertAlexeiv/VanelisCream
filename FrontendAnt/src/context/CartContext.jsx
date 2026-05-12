import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Cargar estado inicial desde localStorage si existe
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
};

const cartReducer = (state, action) => {
  let newItems;
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex > -1) {
        // El producto ya existe: actualizar cantidad
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        // Producto nuevo
        newItems = [...state.items, action.payload];
      }
      return { ...state, items: newItems };
      
    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.id !== action.payload.id);
      return { ...state, items: newItems };
      
    case 'UPDATE_QUANTITY':
      newItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity } 
          : item
      );
      return { ...state, items: newItems };
      
    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sincronizar localStorage cada vez que cambien los productos
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  // Estados derivados
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = state.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  // La lógica del total puede incluir impuestos o envío en el futuro
  const cartTotal = cartSubtotal; 

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId } });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems: state.items, 
        cartCount, 
        cartSubtotal, 
        cartTotal,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
