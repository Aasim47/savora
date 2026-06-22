"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/currency";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, subtotal, removeFromCart, addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();
  const total = subtotal;
  const isEmpty = cartItems.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-base shadow-2xl z-[70] flex flex-col will-change-transform"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-divider">
              <h2 className="text-lg font-medium text-primary">Your Order</h2>
              <button 
                onClick={onClose}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-32 h-32 mb-6 opacity-80">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M20 40H80L75 85H25L20 40Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" />
                      <path d="M35 40V25C35 16.7157 41.7157 10 50 10C58.2843 10 65 16.7157 65 25V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" />
                      <rect x="42" y="48" width="16" height="22" rx="2" fill="currentColor" className="text-accent" />
                      <path d="M46 54H54M46 59H50" stroke="#FBF7F0" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-medium text-primary mb-2">Nothing here yet</h3>
                  <p className="text-secondary text-base">Find something delicious to add to your order.</p>
                </div>
              ) : (
                <div className="px-6 py-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-4 border-b border-divider/60 last:border-0">
                      <div className="flex-1">
                        <div className="text-base font-medium text-primary mb-1">
                          {item.menuItem?.name}
                        </div>
                        <div className="text-sm text-secondary mb-2">
                          {formatCurrency(item.menuItem?.price || 0)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-serif font-medium text-accent">
                          {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
                        </span>
                        
                        <div className="flex items-center gap-3 bg-surface border border-divider rounded-full px-2 py-1">
                          <button 
                            onClick={() => addToCart(item.menuItemId, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-base text-secondary hover:text-primary transition-colors cursor-pointer text-lg font-medium leading-none pb-0.5"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium text-primary w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => addToCart(item.menuItemId, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer text-lg font-medium leading-none pb-0.5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isEmpty && (
              <div className="border-t border-divider p-6 bg-surface">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Delivery Fee</span>
                    <span className="italic">Calculated after confirmation</span>
                  </div>
                  <div className="text-[11px] text-secondary/80 flex items-start gap-1.5 mt-1 bg-surface/50 p-2 rounded border border-divider/50">
                    <span className="text-accent">ⓘ</span>
                    <p><strong>Delivery Rule:</strong> First 2 km are free! After that, it is ₹10 for every additional kilometer.</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-primary pt-3 border-t border-divider">
                    <span>Total (excluding delivery)</span>
                    <span className="text-lg font-serif text-accent">{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    onClose();
                    if (isAuthenticated) {
                      router.push("/checkout");
                    } else {
                      openAuthModal(() => router.push("/checkout"), "Almost there — sign in to complete your order");
                    }
                  }}
                  className="flex items-center justify-center w-full py-4 bg-primary text-base text-center transition-colors hover:bg-primary/90 font-medium rounded-lg cursor-pointer"
                  style={{ color: "var(--base)" }}
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
