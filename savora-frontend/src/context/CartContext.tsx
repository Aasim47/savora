"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api, { TOKEN_KEY_CUSTOMER } from "@/lib/axios";
import { AlertTriangle } from "lucide-react";

interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
    restaurantId?: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (menuItemId: string, quantity: number, name?: string, price?: number, restaurantId?: string) => Promise<boolean>;
  removeFromCart: (menuItemId: string) => Promise<void>;
  clearCart: () => void;
  requestClearCart: (title?: string, message?: string) => Promise<boolean>;
  clearCartBackend: () => Promise<void>;
  subtotal: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  // Load from local storage initially
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('savora-guest-cart');
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
      
      // If they have a token, fetch their backend cart
      if (localStorage.getItem(TOKEN_KEY_CUSTOMER)) {
        fetchCart();
      }
    }
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined" && cartItems.length >= 0) {
      localStorage.setItem('savora-guest-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      if (response.data && response.data.items) {
        // If we have local guest items and the backend cart is empty, we should push them up.
        // For simplicity right now, we will merge backend cart into our local state.
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  const clearCartBackend = async () => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY_CUSTOMER);
    if (hasToken) {
      try {
        await api.delete('/cart/clear');
      } catch (error) {
        console.error("Failed to clear cart on backend", error);
      }
    }
    setCartItems([]);
  };

  const requestClearCart = (customTitle?: string, customMessage?: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmModal({
        title: customTitle || "Different Restaurant",
        message: customMessage || "Your cart contains items from another restaurant. Would you like to clear your cart and start a new order?",
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        }
      });
    });
  };

  const addToCart = async (menuItemId: string, quantity: number, name?: string, price?: number, restaurantId?: string): Promise<boolean> => {
    // Check if adding from a different restaurant
    if (cartItems.length > 0 && restaurantId) {
      const existingRestaurantId = cartItems[0].menuItem?.restaurantId;
      if (existingRestaurantId && existingRestaurantId !== restaurantId) {
        const confirmClear = await requestClearCart();
        if (confirmClear) {
          await clearCartBackend();
          // We will proceed to add below
        } else {
          return false; // Did not add
        }
      }
    }

    const existing = cartItems.find(i => i.menuItemId === menuItemId);
    const newQty = (existing?.quantity || 0) + quantity;

    if (newQty <= 0) {
      await removeFromCart(menuItemId);
      return true;
    }

    // Optimistic local update
    setCartItems(prev => {
      const itemExists = prev.find(i => i.menuItemId === menuItemId);
      if (itemExists) {
        return prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: newQty } : i);
      } else {
        return [...prev, { 
          id: Math.random().toString(), 
          cartId: 'temp', 
          menuItemId, 
          quantity: newQty, 
          menuItem: { name: name || 'Item', price: price || 0, restaurantId } 
        }];
      }
    });

    const hasToken = !!localStorage.getItem(TOKEN_KEY_CUSTOMER);
    if (!hasToken) {
      // Guest mode: just return true, local storage will save it
      return true;
    }

    try {
      // Pass the *delta* quantity to the backend
      const response = await api.post('/cart/add', { menuItemId, quantity });
      // Remove 'temp' flag so checkout doesn't try to sync it again
      setCartItems(prev => prev.map(i => 
        i.menuItemId === menuItemId 
          ? { ...i, cartId: response.data.cartId || 'synced' } 
          : i
      ));
      return true;
    } catch (error: any) {
      console.error("Failed to add to cart", error);
      if (error.response?.data?.message === "DIFFERENT_RESTAURANT") {
        // Backend fallback error if somehow skipped
        const confirmClear = await requestClearCart();
        if (confirmClear) {
          await clearCartBackend();
          return addToCart(menuItemId, quantity, name, price, restaurantId);
        }
      }
      return false;
    }
  };

  const removeFromCart = async (menuItemId: string) => {
    setCartItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
    
    const hasToken = !!localStorage.getItem(TOKEN_KEY_CUSTOMER);
    if (!hasToken) return;

    try {
      await api.post('/cart/remove', { menuItemId });
    } catch (error: any) {
      console.error("Failed to remove from cart", error);
    }
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.menuItem?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, requestClearCart, clearCartBackend, subtotal, fetchCart }}>
      {children}
      
      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-divider/50 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-xl font-serif text-primary mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={confirmModal.onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-divider text-sm font-medium text-primary hover:bg-base transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                style={{ color: "var(--base)" }}
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
