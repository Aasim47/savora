"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface StickyCartBarProps {
  isCartOpen: boolean;
  onOpenCart: () => void;
}

export function StickyCartBar({ isCartOpen, onOpenCart }: StickyCartBarProps) {
  const { cartItems, subtotal } = useCart();
  const pathname = usePathname();

  // Calculate total items (sum of quantities)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // We only show the bar if there are items in the cart, the main cart drawer is NOT currently open, AND we are NOT on the checkout page
  const isVisible = totalItems > 0 && !isCartOpen && pathname !== "/checkout";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-0 right-0 z-40 mx-auto px-4 max-w-[600px]"
        >
          <button
            onClick={onOpenCart}
            className="w-full bg-accent/95 hover:bg-accent backdrop-blur-md shadow-2xl rounded-2xl p-4 flex items-center justify-between text-white group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-[15px]">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
                <span className="text-[13px] text-white/80 font-medium">
                  {formatCurrency(subtotal)} plus taxes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-semibold text-[15px]">
              <span>View Cart</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
