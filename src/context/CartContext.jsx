import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = () => {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return {
          ...state,
          items: updatedItems,
          total: state.total + action.payload.price
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price
      };

    case 'REMOVE_FROM_CART':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity)
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const quantityDiff = action.payload.quantity - item.quantity;
          return {
            ...item,
            quantity: action.payload.quantity
          };
        }
        return item;
      });

      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: updatedItems,
        total: newTotal
      };

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, undefined, initialState);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: product
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        id: productId,
        quantity: quantity
      }
    });
  };

  const clearCart = () => {
    dispatch({
      type: 'CLEAR_CART'
    });
  };

  return (
    <CartContext.Provider value={{
      cartItems: cart.items,
      cartTotal: cart.total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};