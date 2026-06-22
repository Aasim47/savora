"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";

interface Toast {
  id: string;
  orderId: string;
  shortId: string;
  customerName: string;
  restaurantName: string;
  amount: number;
  timestamp: number;
}

interface NotificationContextType {
  pendingCount: number;
}

const NotificationContext = createContext<NotificationContextType>({ pendingCount: 0 });

export const useNotifications = () => useContext(NotificationContext);

export function OrderNotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstPollRef = useRef(true);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auto-dismiss toasts after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [toasts]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get("/orders");
        const orders: any[] = res.data;

        // Count pending orders
        const pending = orders.filter(o => o.status === "PENDING").length;
        setPendingCount(pending);

        const currentIds = new Set(orders.map((o: any) => o.id));

        if (isFirstPollRef.current) {
          // On first poll, just store the IDs — don't show toasts
          knownOrderIdsRef.current = currentIds;
          isFirstPollRef.current = false;
          return;
        }

        // Find new PENDING orders that we haven't seen before
        const newOrders = orders.filter(
          (o: any) => o.status === "PENDING" && !knownOrderIdsRef.current.has(o.id)
        );

        if (newOrders.length > 0) {
          const newToasts: Toast[] = newOrders.map((o: any) => ({
            id: `toast-${o.id}-${Date.now()}`,
            orderId: o.id,
            shortId: o.id.split("-")[0],
            customerName: o.customerName || o.user?.name || "Customer",
            restaurantName: o.restaurant?.name || "Restaurant",
            amount: o.totalAmount,
            timestamp: Date.now(),
          }));
          setToasts(prev => [...prev, ...newToasts]);
        }

        knownOrderIdsRef.current = currentIds;
      } catch (error) {
        // Silently fail on poll errors
      }
    };

    poll(); // Initial poll
    const interval = setInterval(poll, 60000); // Fallback poll every 60 seconds

    // Socket.io Setup
    const socketURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
    const socket = io(socketURL);

    socket.on("connect", () => {
      socket.emit("join", "admin");
    });

    socket.on("new-order", (newOrder: any) => {
      if (knownOrderIdsRef.current.has(newOrder.id)) return;
      knownOrderIdsRef.current.add(newOrder.id);
      
      setPendingCount(prev => prev + 1);
      
      const newToast: Toast = {
        id: `toast-${newOrder.id}-${Date.now()}`,
        orderId: newOrder.id,
        shortId: newOrder.id.split("-")[0],
        customerName: newOrder.customerName || newOrder.user?.name || "Customer",
        restaurantName: newOrder.restaurant?.name || "Restaurant",
        amount: newOrder.totalAmount,
        timestamp: Date.now(),
      };
      setToasts(prev => [...prev, newToast]);
    });

    socket.on("order-updated", () => {
      poll(); // Re-fetch all orders to keep the UI perfectly synced if status changes
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ pendingCount }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-surface border border-divider rounded-[14px] shadow-2xl p-4 w-[340px] animate-in slide-in-from-right duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-primary">New Order!</h4>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-secondary hover:text-primary transition-colors cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-secondary mb-2 truncate">
                  <span className="font-medium text-primary">{toast.customerName}</span> ordered from{" "}
                  <span className="font-medium">{toast.restaurantName}</span>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary font-mono">#{toast.shortId}</span>
                  <Link
                    href="/admin/orders"
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
