"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatCurrency } from "@/utils/currency";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Printer, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ReviewModal } from "@/components/orders/ReviewModal";

function OrderCard({ order, fetchOrders }: { order: any; fetchOrders: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const { addToCart, requestClearCart, clearCartBackend, cartItems } = useCart();
  const router = useRouter();

  const handleReorder = async () => {
    setIsReordering(true);

    if (cartItems.length > 0) {
      const confirm = await requestClearCart(
        "Clear Current Cart?",
        "Reordering will replace your current cart with these items. Do you want to proceed?"
      );
      if (!confirm) {
        setIsReordering(false);
        return;
      }
      await clearCartBackend();
    }

    let success = true;
    for (const item of order.items) {
      const added = await addToCart(
        item.menuItemId,
        item.quantity,
        item.menuItem?.name,
        item.unitPrice,
        order.restaurantId
      );
      if (!added) {
        success = false;
        break;
      }
    }
    setIsReordering(false);
    if (success) {
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-surface border border-divider rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-divider/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-medium text-primary mb-1">{order.restaurant?.name || "Restaurant"}</h3>
            <p className="text-xs text-secondary">
              Order #{order.id.split('-')[0]} • {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-secondary block mb-0.5">Total Amount</span>
            <span className="text-xl font-serif text-accent">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        {/* Timeline */}
        <OrderTimeline status={order.status} />

        {/* Expand Toggle */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-6 py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors bg-base rounded-lg border border-divider/50 cursor-pointer"
        >
          {expanded ? "Hide Details" : "View Details"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Items & Total Breakdown (Expandable) */}
      {expanded && (
        <div className="p-6 bg-base/30">
          <div className="space-y-3 mb-6">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-base border border-divider flex items-center justify-center text-xs font-medium text-secondary">
                    {item.quantity}x
                  </span>
                  <span className="text-sm text-primary">{item.menuItem?.name}</span>
                </div>
                <span className="text-sm text-secondary">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-divider/50 space-y-2">
            <div className="flex justify-between items-center text-sm text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(order.totalAmount - (order.deliveryFee || 0) + (order.discountAmount || 0))}</span>
            </div>
            {(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between items-center text-sm text-accent">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            {order.deliveryFee !== undefined && (
              <div className="flex justify-between items-center text-sm text-secondary">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-primary font-medium">Total Amount</span>
              <span className="text-lg font-medium text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.deliveryFee !== undefined && (
              <div className="text-[11px] text-secondary/80 flex items-start gap-1.5 mt-2 bg-surface/50 p-2 rounded border border-divider/50">
                <span className="text-accent">ⓘ</span>
                <p><strong>Delivery Rule:</strong> First 2 km are free. After that, the charge is ₹10 per additional kilometer.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {order.status === "DELIVERED" && (
            <div className="mt-6 pt-4 border-t border-divider border-dashed flex justify-end gap-3">
              {!order.review && (
                <button
                  onClick={() => {
                    const event = new CustomEvent("open-review-modal", { detail: { orderId: order.id, restaurantName: order.restaurant?.name } });
                    window.dispatchEvent(event);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg text-sm font-medium text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                >
                  ⭐ Rate Order
                </button>
              )}
              {order.review && (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-secondary bg-surface border border-divider rounded-lg">
                  ⭐ Rated {order.review.rating}/5
                </span>
              )}
              <Link 
                href={`/orders/${order.id}/receipt`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-divider rounded-lg text-sm font-medium text-primary hover:bg-base transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </Link>
              <button
                onClick={handleReorder}
                disabled={isReordering}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70"
                style={{ color: "var(--base)" }}
              >
                <RotateCcw className={cn("w-4 h-4", isReordering && "animate-spin")} />
                {isReordering ? "Reordering..." : "Reorder"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/orders/me");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  // Protect route
  useEffect(() => {
    // If not authenticated, redirect home and open modal to login
    if (typeof window !== "undefined" && !localStorage.getItem("savora-customer-token")) {
      router.replace("/");
      // Small timeout to allow the layout to mount if needed
      setTimeout(() => {
        openAuthModal(() => router.push("/orders"), "Sign in to view your orders");
      }, 100);
      return;
    }

    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [router, openAuthModal]);

  return (
    <div className="min-h-screen bg-base pt-[64px]">
      <Navbar />
      <ReviewModal onReviewSubmitted={() => fetchOrders()} />

      <main className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="font-serif text-4xl text-primary">Your Orders</h1>
          </div>
          <button 
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-divider rounded-lg text-sm font-medium text-primary hover:bg-base transition-colors cursor-pointer disabled:opacity-50 mt-8"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-surface border border-divider rounded-[14px] p-6 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="w-48 h-6 bg-divider/40 rounded mb-2"></div>
                    <div className="w-32 h-4 bg-divider/40 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-20 h-3 bg-divider/40 rounded mb-1.5 ml-auto"></div>
                    <div className="w-16 h-6 bg-divider/40 rounded ml-auto"></div>
                  </div>
                </div>
                <div className="mt-8 flex gap-2">
                  <div className="w-full h-2 bg-divider/40 rounded-full"></div>
                  <div className="w-full h-2 bg-divider/40 rounded-full"></div>
                  <div className="w-full h-2 bg-divider/40 rounded-full"></div>
                </div>
                <div className="w-full mt-6 h-9 bg-divider/40 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface border border-divider rounded-[14px] p-12 text-center flex flex-col items-center">
            <div className="w-32 h-32 mb-6 opacity-80">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="25" y="15" width="50" height="70" rx="4" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                <path d="M35 30H65M35 45H65M35 60H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-secondary" />
                <circle cx="70" cy="75" r="12" fill="currentColor" className="text-accent" />
                <path d="M66 75L69 78L75 71" stroke="#FBF7F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-primary mb-2">No orders yet</h3>
            <p className="text-secondary mb-6 max-w-md">You haven't placed any orders yet. Start exploring our menu to find your next favorite meal!</p>
            <Link href="/" className="inline-flex px-6 py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors" style={{ color: "var(--base)" }}>
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} fetchOrders={() => fetchOrders(false)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
