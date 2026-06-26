"use client";

import { useState } from "react";
import { Plus, Check, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/currency";
import { useCart } from "@/context/CartContext";
import { Minus } from "lucide-react";

interface MenuRowProps {
  restaurantId?: string;
  items: {
    id: string;
    name: string;
    description: string;
    portionSize?: string;
    price: number;
    imageUrl: string;
    available?: boolean;
  }[];
  isClosed?: boolean;
}

export function MenuRow({ items, restaurantId, isClosed }: MenuRowProps) {
  const [showVariants, setShowVariants] = useState(false);
  const { addToCart, removeFromCart, cartItems } = useCart();

  const isGroup = items.length > 1;
  const baseItem = items[0];
  const lowestPrice = Math.min(...items.map(i => i.price));
  const isAvailable = isGroup ? items.some(i => i.available !== false) : baseItem.available !== false;

  const getCartItem = (itemId: string) => {
    return cartItems.find(item => item.menuItemId === itemId);
  };

  const handleAdd = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    await addToCart(itemId, 1, item?.name || baseItem.name, item?.price || baseItem.price, restaurantId);
  };

  const handleRemove = async (itemId: string) => {
    const item = getCartItem(itemId);
    if (item) {
      if (item.quantity <= 1) {
        await removeFromCart(itemId);
      } else {
        const menuItem = items.find(i => i.id === itemId);
        await addToCart(itemId, -1, menuItem?.name || baseItem.name, menuItem?.price || baseItem.price, restaurantId);
      }
    }
  };

  const baseCartItem = !isGroup ? getCartItem(baseItem.id) : null;

  const image = baseItem.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop";

  return (
    <>
      <div className={`flex items-center gap-4 py-4 border-b border-divider/50 group hover:bg-surface/30 transition-colors px-2 -mx-2 rounded-[14px] ${!isAvailable ? 'opacity-60' : ''}`}>
        <div className="flex-shrink-0 w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-surface">
          <img 
            src={image} 
            alt={baseItem.name}
            className={`w-full h-full object-cover ${!isAvailable ? 'grayscale' : ''}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-primary mb-0.5 truncate">
            {baseItem.name}
            {!isGroup && baseItem.portionSize && <span className="inline-block text-[10px] bg-divider/30 text-secondary px-1.5 py-0.5 rounded-full ml-2 translate-y-[-1px]">{baseItem.portionSize}</span>}
            {!isAvailable && <span className="inline-block text-[10px] bg-error/10 text-error border border-error/20 px-1.5 py-0.5 rounded-full ml-2 translate-y-[-1px]">Out of Stock</span>}
          </h4>
          <p className="text-sm text-secondary truncate">{baseItem.description}</p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-lg font-serif font-medium text-accent">
            {isGroup ? `From ${formatCurrency(lowestPrice)}` : formatCurrency(baseItem.price)}
          </span>
          
          {isClosed ? (
            <button disabled className="relative flex items-center justify-center px-3 py-1.5 rounded-full border border-divider text-secondary cursor-not-allowed bg-surface">
              <span className="text-[11px] font-medium uppercase tracking-wider">Closed</span>
            </button>
          ) : !isAvailable ? (
            <button disabled className="relative flex items-center justify-center px-3 py-1.5 rounded-full border border-divider text-secondary cursor-not-allowed bg-surface">
              <span className="text-[11px] font-medium uppercase tracking-wider">Unavailable</span>
            </button>
          ) : isGroup ? (
            <button
              onClick={() => setShowVariants(true)}
              className="relative flex items-center justify-center px-3 py-1.5 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base cursor-pointer bg-transparent border-divider text-primary hover:border-primary"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">Options <ChevronDown className="w-3 h-3"/></span>
            </button>
          ) : baseCartItem ? (
            <div className="flex items-center gap-3 px-2 py-1 rounded-full border border-accent bg-accent/5">
              <button onClick={() => handleRemove(baseItem.id)} className="w-6 h-6 flex items-center justify-center text-accent hover:bg-accent hover:text-white rounded-full transition-colors cursor-pointer">
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-sm font-medium text-primary w-2 text-center">{baseCartItem.quantity}</span>
              <button onClick={() => handleAdd(baseItem.id)} className="w-6 h-6 flex items-center justify-center text-accent hover:bg-accent hover:text-white rounded-full transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAdd(baseItem.id)}
              className="relative flex items-center justify-center px-3 py-1.5 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base cursor-pointer bg-transparent border-divider text-primary hover:border-primary"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1"><Plus className="w-3 h-3"/> Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Variants Modal */}
      <AnimatePresence>
        {showVariants && isGroup && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-surface w-full sm:w-[400px] sm:rounded-[24px] rounded-t-[24px] overflow-hidden border border-divider/20 shadow-2xl pb-safe"
            >
              <div className="flex justify-between items-center p-5 border-b border-divider/50">
                <h3 className="font-serif text-2xl text-primary">{baseItem.name}</h3>
                <button onClick={() => setShowVariants(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-base text-secondary hover:text-primary transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                {items.map((variant) => {
                  const variantCartItem = getCartItem(variant.id);
                  return (
                    <div key={variant.id} className={`flex justify-between items-center p-4 hover:bg-base/50 rounded-xl transition-colors mb-1 ${variant.available === false ? 'opacity-60' : ''}`}>
                      <div>
                        <span className="text-base font-medium text-primary">{variant.portionSize || "Regular"}</span>
                        {variant.available === false && <span className="inline-block text-[10px] bg-error/10 text-error border border-error/20 px-1.5 py-0.5 rounded-full ml-2 translate-y-[-1px]">Out of Stock</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-serif font-medium text-accent">{formatCurrency(variant.price)}</span>
                        {variant.available === false ? (
                           <button disabled className="bg-surface text-secondary border border-divider px-3 py-1.5 rounded-full text-xs font-medium cursor-not-allowed">Unavailable</button>
                        ) : variantCartItem ? (
                          <div className="flex items-center gap-3 px-2 py-1 rounded-full border border-accent bg-accent/5">
                            <button onClick={() => handleRemove(variant.id)} className="w-6 h-6 flex items-center justify-center text-accent hover:bg-accent hover:text-white rounded-full transition-colors cursor-pointer">
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <span className="text-sm font-medium text-primary w-2 text-center">{variantCartItem.quantity}</span>
                            <button onClick={() => handleAdd(variant.id)} className="w-6 h-6 flex items-center justify-center text-accent hover:bg-accent hover:text-white rounded-full transition-colors cursor-pointer">
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAdd(variant.id)}
                            className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                            style={{ color: "var(--base)" }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
