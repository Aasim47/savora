"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api, { TOKEN_KEY_CUSTOMER } from "@/lib/axios";
import { X, Truck, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/currency";
import { io } from "socket.io-client";

interface Toast {
  id: string;
  orderId: string;
  shortId: string;
  restaurantName: string;
  newTotal: number;
  deliveryFee: number;
  deliveryDistance: number;
  visible: boolean;
}

const CustomerNotificationContext = createContext({});

export function CustomerNotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const knownDistancesRef = useRef<Record<string, number>>({});
  const isFirstPollRef = useRef(true);

  const dismissToast = useCallback((id: string) => {
    // Animate out first, then remove
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Auto-dismiss toasts after 12 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      const oldest = toasts[0];
      if (oldest) dismissToast(oldest.id);
    }, 12000);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  useEffect(() => {
    // Only poll if the customer is logged in
    const token = localStorage.getItem(TOKEN_KEY_CUSTOMER);
    if (!token) return;

    const poll = async () => {
      try {
        const res = await api.get("/orders/me");
        const rawData = res.data;
        const orders: any[] = Array.isArray(rawData) ? rawData : (rawData.data || []);

        const currentDistances: Record<string, number> = {};

        if (isFirstPollRef.current) {
          orders.forEach(o => {
            if (o.status === "PENDING" || o.status === "ACCEPTED" || o.status === "PREPARING") {
              if (o.deliveryDistance !== null) {
                currentDistances[o.id] = o.deliveryDistance;
              }
            }
          });
          knownDistancesRef.current = currentDistances;
          isFirstPollRef.current = false;
          return;
        }

        const newToasts: Toast[] = [];

        orders.forEach(o => {
          if (o.status === "PENDING" || o.status === "ACCEPTED" || o.status === "PREPARING") {
            if (o.deliveryDistance !== null) {
              currentDistances[o.id] = o.deliveryDistance;

              const previousDistance = knownDistancesRef.current[o.id];
              if (previousDistance === undefined || previousDistance !== o.deliveryDistance) {
                newToasts.push({
                  id: `toast-${o.id}-${Date.now()}`,
                  orderId: o.id,
                  shortId: o.id.split("-")[0],
                  restaurantName: o.restaurant?.name || "Restaurant",
                  newTotal: o.totalAmount,
                  deliveryFee: o.deliveryFee || 0,
                  deliveryDistance: o.deliveryDistance,
                  visible: true,
                });
              }
            }
          }
        });

        if (newToasts.length > 0) {
          setToasts(prev => [...prev, ...newToasts]);
        }

        knownDistancesRef.current = currentDistances;
      } catch (error) {
        // Silently fail
      }
    };

    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId || payload.id;
    } catch(e) {}

    poll();
    const interval = setInterval(poll, 60000); // Changed fallback to 60s

    // Socket.io Setup
    const socketURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
    const socket = io(socketURL);

    socket.on("connect", () => {
      if (userId) {
        socket.emit("join", `user_${userId}`);
      }
    });

    socket.on("order-updated", () => {
      poll(); // Re-fetch on socket event
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <CustomerNotificationContext.Provider value={{}}>
      {children}

      {/* Notification Toast Stack */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-[380px]">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`pointer-events-auto transition-all duration-300 ease-out ${
              toast.visible
                ? "animate-in slide-in-from-right opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-divider/60">
              {/* Accent top stripe */}
              <div className="h-[3px] bg-gradient-to-r from-accent via-accent/80 to-accent/40" />
              
              <div className="bg-surface/95 backdrop-blur-xl p-4">
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-[18px] h-[18px] text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-semibold text-primary leading-tight">
                        Delivery Fee Updated
                      </h4>
                      <button
                        onClick={() => dismissToast(toast.id)}
                        className="text-secondary/60 hover:text-primary transition-colors cursor-pointer p-1 -mr-1 rounded-lg hover:bg-base/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                      <span className="font-medium text-primary">{toast.restaurantName}</span>
                      {" · "}
                      <span className="font-mono text-[10px] text-secondary/80">#{toast.shortId}</span>
                    </p>
                  </div>
                </div>

                {/* Price breakdown card */}
                <div className="bg-base rounded-xl p-3 border border-divider/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-secondary/60" />
                      <span className="text-[11px] text-secondary">Distance</span>
                    </div>
                    <span className="text-[11px] font-medium text-primary tabular-nums">
                      {toast.deliveryDistance} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-secondary/60" />
                      <span className="text-[11px] text-secondary">Delivery Fee</span>
                    </div>
                    <span className={`text-[11px] font-medium tabular-nums ${toast.deliveryFee > 0 ? "text-primary" : "text-accent"}`}>
                      {toast.deliveryFee > 0 ? formatCurrency(toast.deliveryFee) : "FREE"}
                    </span>
                  </div>
                  <div className="h-px bg-divider/60 my-0.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">Updated Total</span>
                    <span className="text-sm font-semibold text-accent tabular-nums">
                      {formatCurrency(toast.newTotal)}
                    </span>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-secondary/60 uppercase tracking-wider font-medium">
                    Just now
                  </span>
                  <Link
                    href="/orders"
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors group"
                  >
                    View Order
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Auto-dismiss countdown bar */}
              <div className="h-[2px] bg-divider/30">
                <div className="h-full bg-accent/50 toast-progress-bar rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CustomerNotificationContext.Provider>
  );
}
