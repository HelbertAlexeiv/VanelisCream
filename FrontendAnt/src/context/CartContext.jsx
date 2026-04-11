import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Initial state loads from localStorage if available
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
};

const cartReducer = (state, action) => {
  let newItems;
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex > -1) {
        // Item exists: update quantity immutably
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        // New item
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

  // Sync to localStorage every time the cart items change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  // Derived states
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = state.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  // Total logic can include taxes/shipping if needed, for now equal to subtotal
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
