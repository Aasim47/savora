"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/utils/currency";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";
import { RefreshCw, ChevronDown, ChevronUp, Search, Filter, AlertTriangle, XCircle, CheckCircle, X } from "lucide-react";

// --- Inline Toast System ---
interface AdminToast {
  id: string;
  type: "error" | "warning" | "success";
  title: string;
  message: string;
  visible: boolean;
}

function AdminToastContainer({ toasts, onDismiss }: { toasts: AdminToast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none max-w-[400px]">
      {toasts.map((toast, index) => {
        const Icon = toast.type === "error" ? XCircle : toast.type === "warning" ? AlertTriangle : CheckCircle;
        const accentColor = toast.type === "error" ? "#C0392B" : toast.type === "warning" ? "#D4850A" : "#2D8C4E";
        const bgTint = toast.type === "error" ? "bg-red-500/8" : toast.type === "warning" ? "bg-amber-500/8" : "bg-emerald-500/8";
        const iconBg = toast.type === "error" ? "bg-red-500/10 border-red-500/20" : toast.type === "warning" ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20";

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto transition-all duration-300 ease-out",
              toast.visible
                ? "animate-in slide-in-from-right opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-divider/60">
              <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}80, ${accentColor}40)` }} />
              <div className={cn("bg-surface/95 backdrop-blur-xl p-4", bgTint)}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0", iconBg)}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-semibold text-primary leading-tight">{toast.title}</h4>
                      <button
                        onClick={() => onDismiss(toast.id)}
                        className="text-secondary/60 hover:text-primary transition-colors cursor-pointer p-1 -mr-1 rounded-lg hover:bg-base/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[12px] text-secondary mt-1 leading-relaxed">{toast.message}</p>
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-divider/30">
                <div className="h-full rounded-full toast-progress-bar" style={{ background: `${accentColor}60`, '--toast-duration': '6s' } as React.CSSProperties} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Toast state
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const showToast = useCallback((type: AdminToast["type"], title: string, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, title, message, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try {
      await api.patch(`/orders/${id}/status`, { status });
    } catch (error: any) {
      console.error("Failed to update status", error);
      if (error.response?.data?.message === "DELIVERY_DISTANCE_REQUIRED") {
        window.dispatchEvent(new CustomEvent('api-error', { 
          detail: { 
            title: "Delivery Distance Required", 
            message: "You must enter the delivery distance before accepting this order! We need this to calculate the delivery fee." 
          } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('api-error', { 
          detail: { 
            title: "Status Update Failed", 
            message: error.response?.data?.message || "Could not update the order status. Please try again." 
          } 
        }));
      }
      fetchOrders(); // Revert on failure
    }
  };

  const [updatingDistanceId, setUpdatingDistanceId] = useState<string | null>(null);

  const handleDistanceUpdate = async (id: string, distance: number) => {
    // Optimistic Update
    const fee = distance <= 2 ? 0 : (distance - 2) * 10;
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const itemsTotal = o.items?.reduce((total: number, item: any) => total + (item.quantity * item.unitPrice), 0) || 0;
        const discount = o.discountAmount || 0;
        const newTotal = Math.max(0, itemsTotal + fee - discount);
        return { ...o, deliveryDistance: distance, deliveryFee: fee, totalAmount: newTotal };
      }
      return o;
    }));

    setUpdatingDistanceId(id);
    try {
      await api.patch(`/orders/${id}/distance`, { distance });
      showToast("success", "Distance Updated", `Delivery fee set to ${fee > 0 ? formatCurrency(fee) : 'Free'} for ${distance} km.`);
    } catch (error: any) {
      console.error("Failed to update distance", error);
      if (error.response?.data?.message === "DISTANCE_LOCKED") {
        showToast("warning", "Distance Locked", "Cannot update the delivery distance once the order is out for delivery.");
      } else {
        showToast("error", "Update Failed", "Could not update the delivery distance. Please try again.");
      }
      fetchOrders(); // Revert on failure
    } finally {
      setUpdatingDistanceId(null);
    }
  };

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading orders...</div>;

  return (
    <>
    <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-4xl text-primary mb-2">Orders</h1>
          <p className="text-secondary">Manage and track all platform orders.</p>
        </div>
        <button 
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-divider rounded-lg text-sm font-medium text-primary hover:bg-base transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary/60" />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or Restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-divider rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-secondary/60" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-surface border border-divider rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all cursor-pointer appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-secondary/60" />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-base/50">
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans hidden sm:table-cell">Date</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Order ID</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans hidden md:table-cell">Customer</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans hidden lg:table-cell">Restaurant</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Total</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredOrders = orders.filter(order => {
                  const searchStr = searchQuery.toLowerCase();
                  const matchesSearch = 
                    order.id.toLowerCase().includes(searchStr) || 
                    (order.customerName || order.user?.name || "").toLowerCase().includes(searchStr) ||
                    (order.restaurant?.name || "").toLowerCase().includes(searchStr);
                  
                  const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
                  return matchesSearch && matchesStatus;
                });

                if (filteredOrders.length === 0) {
                  return <tr><td colSpan={6} className="py-8 text-center text-secondary">No orders match your filters.</td></tr>;
                }

                return filteredOrders.map((order) => {
                  const isDistanceLocked = order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED" || order.status === "CANCELLED";
                  return (
                  <React.Fragment key={order.id}>
                  <tr className={cn("border-b border-divider/60 hover:bg-base/30 transition-colors", expandedOrderId === order.id && "bg-base/50")}>
                    <td className="py-4 px-6 text-sm text-secondary whitespace-nowrap hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleExpand(order.id)}
                        className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline cursor-pointer outline-none"
                      >
                        {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {order.id.split('-')[0]}
                      </button>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="text-sm text-primary">{order.customerName || order.user?.name || order.user?.email || "Unknown"}</div>
                      {order.customerPhone && (
                        <div className="text-[11px] text-secondary mt-0.5">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-secondary hidden lg:table-cell">{order.restaurant?.name || "Unknown"}</td>
                    <td className="py-4 px-6 text-sm text-primary font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4 px-6">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={cn(
                          "px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider rounded-md outline-none cursor-pointer border border-transparent hover:border-divider focus:ring-2 focus:ring-accent",
                          order.status === "PENDING" ? "bg-[#FEF3C7]/50 text-[#92400E] dark:bg-amber-900/40 dark:text-amber-400" :
                          order.status === "PREPARING" ? "bg-[#DBEAFE]/50 text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-400" :
                          order.status === "OUT_FOR_DELIVERY" ? "bg-[#E0E7FF]/50 text-[#4338CA] dark:bg-indigo-900/40 dark:text-indigo-400" :
                          order.status === "DELIVERED" ? "bg-[#D1FAE5]/50 text-[#065F46] dark:bg-emerald-900/40 dark:text-emerald-400" :
                          "bg-surface border-divider text-secondary dark:bg-surface/50 dark:text-secondary/80"
                        )}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-surface border-b border-divider/60 shadow-[inset_0_4px_6px_-6px_rgba(0,0,0,0.1)]">
                      <td colSpan={6} className="py-6 px-4 md:px-8">
                        <div className="bg-base rounded-xl border border-divider p-4 md:p-5 shadow-sm max-w-2xl relative">
                          
                          {/* Mobile-only Info Block */}
                          <div className="lg:hidden mb-6 p-4 bg-surface rounded-lg border border-divider/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:hidden">
                              <span className="block text-[10px] font-semibold text-secondary uppercase tracking-widest mb-0.5">Date</span>
                              <span className="text-sm text-primary">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="md:hidden">
                              <span className="block text-[10px] font-semibold text-secondary uppercase tracking-widest mb-0.5">Customer</span>
                              <span className="text-sm text-primary">{order.customerName || order.user?.name || order.user?.email || "Unknown"}</span>
                              {order.customerPhone && <span className="block text-xs text-secondary mt-0.5">{order.customerPhone}</span>}
                            </div>
                            <div>
                              <span className="block text-[10px] font-semibold text-secondary uppercase tracking-widest mb-0.5">Restaurant</span>
                              <span className="text-sm text-secondary">{order.restaurant?.name || "Unknown"}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-semibold text-secondary uppercase tracking-widest">Order Items</h4>
                            <a 
                              href={`/orders/${order.id}/receipt`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                            >
                              Print Receipt
                            </a>
                          </div>
                          <div className="space-y-3 mb-6">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b border-divider/30 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-md bg-surface border border-divider flex items-center justify-center text-xs font-medium text-primary">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-sm font-medium text-primary">{item.menuItem?.name}</span>
                                </div>
                                <span className="text-sm font-medium text-secondary">{formatCurrency(item.unitPrice * item.quantity)}</span>
                              </div>
                            ))}
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between items-center py-2 border-t border-divider/50 pt-3">
                                <span className="text-sm font-medium text-accent">Discount Applied {order.promoCodeId ? `(Promo)` : ''}</span>
                                <span className="text-sm font-medium text-accent">-{formatCurrency(order.discountAmount)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-divider mt-4">
                            <h4 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">Delivery Information</h4>
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                              <div className="flex-1">
                                <label className="block text-xs text-secondary mb-1">Customer Details</label>
                                <p className="text-sm text-primary mb-0.5">{order.deliveryAddress || "No address provided"}</p>
                                {order.customerPhone && <p className="text-sm text-secondary font-mono">{order.customerPhone}</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <label htmlFor={`distance-${order.id}`} className="text-xs text-secondary mb-1">Distance (km)</label>
                                  <input 
                                    id={`distance-${order.id}`}
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    disabled={isDistanceLocked}
                                    defaultValue={order.deliveryDistance ?? ''}
                                    placeholder="e.g. 2.5"
                                    className="w-24 bg-surface border border-divider rounded-md px-3 py-1.5 text-sm text-primary outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !isDistanceLocked) {
                                        const val = parseFloat(e.currentTarget.value);
                                        if (!isNaN(val)) handleDistanceUpdate(order.id, val);
                                      }
                                    }}
                                  />
                                </div>
                                <button 
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling?.querySelector('input');
                                    const val = parseFloat(input?.value || '');
                                    if (!isNaN(val)) handleDistanceUpdate(order.id, val);
                                  }}
                                  disabled={updatingDistanceId === order.id || isDistanceLocked}
                                  className="px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                                >
                                  {updatingDistanceId === order.id ? (
                                    <span className="flex items-center gap-1.5">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    </span>
                                  ) : (
                                    "Update Fee"
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-between items-center text-sm border-b border-divider/50 pb-3">
                              <span className="text-secondary">Delivery Fee Applied:</span>
                              <span className="font-medium text-primary">{formatCurrency(order.deliveryFee || 0)}</span>
                            </div>
                            <div className="mt-2 text-[11px] text-secondary/80 flex items-start gap-1.5">
                              <span className="text-accent">ⓘ</span>
                              <p><strong>Delivery Rule:</strong> First 2 km are free. After that, the charge is ₹10 per additional kilometer. Auto-calculates upon saving.</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
