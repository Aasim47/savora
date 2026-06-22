"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, X, Trash2, Tag } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    restaurantId: "ALL",
  });

  const fetchData = async () => {
    try {
      const [promosRes, restRes] = await Promise.all([
        api.get("/promos"),
        api.get("/restaurants")
      ]);
      setPromos(promosRes.data);
      // Depending on how restaurants is returned ({success, data} vs data)
      const restData = Array.isArray(restRes.data) ? restRes.data : (restRes.data.data || []);
      setRestaurants(restData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/promos", {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        restaurantId: form.restaurantId === "ALL" ? undefined : form.restaurantId,
      });
      setIsModalOpen(false);
      setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "", restaurantId: "ALL" });
      fetchData();
    } catch (error: any) {
      if (error.response?.data?.message === "Validation failed" && error.response.data.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([key, val]: any) => `${key}: ${val.join(', ')}`)
          .join('\n');
        alert("Please check your details:\n" + errorMessages);
      } else {
        alert(error.response?.data?.message || "Failed to create promo code");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;
    try {
      await api.delete(`/promos/${promoToDelete}`);
      setPromoToDelete(null);
      fetchData();
    } catch (error) {
      alert("Failed to delete promo code");
    }
  };

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading promo codes...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-4xl text-primary mb-2">Promo Codes</h1>
          <p className="text-secondary">Create and manage discount codes for customers.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          style={{ color: "var(--base)" }}
        >
          <Plus className="w-4 h-4" />
          New Promo
        </button>
      </div>

      <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-base/50">
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Code</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Scope</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Discount</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Min Order</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Usage</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Expires</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-secondary">No promo codes yet. Create your first one!</td></tr>
              ) : (
                promos.map((promo) => {
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                  const isMaxed = promo.maxUses && promo.usedCount >= promo.maxUses;
                  const statusLabel = !promo.isActive ? "Inactive" : isExpired ? "Expired" : isMaxed ? "Maxed Out" : "Active";
                  const statusColor = statusLabel === "Active"
                    ? "bg-[#D1FAE5]/50 text-[#065F46]"
                    : "bg-surface border border-divider text-secondary";

                  return (
                    <tr key={promo.id} className="border-b border-divider/60 hover:bg-base/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-accent" />
                          <span className="text-sm font-mono font-medium text-primary">{promo.code}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary">
                        {promo.restaurant ? promo.restaurant.name : "Universal"}
                      </td>
                      <td className="py-4 px-6 text-sm text-primary font-medium">
                        {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary">
                        {promo.minOrderAmount ? `₹${promo.minOrderAmount}` : "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary">
                        {promo.usedCount}{promo.maxUses ? ` / ${promo.maxUses}` : ""}
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full", statusColor)}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setPromoToDelete(promo.id)}
                          className="p-1.5 text-secondary hover:text-error transition-colors cursor-pointer rounded-md hover:bg-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-md border border-divider overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <h2 className="font-serif text-xl text-primary">New Promo Code</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Code</label>
                <input
                  required
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME20"
                  className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Value</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 50"}
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Applicable Restaurant</label>
                  <select
                    value={form.restaurantId}
                    onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                    className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="ALL">Universal (All Restaurants)</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-secondary hover:text-primary cursor-pointer transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors" 
                  style={{ color: "var(--base)" }}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {promoToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-sm border border-divider overflow-hidden p-6 text-center">
            <h3 className="font-serif text-xl text-primary mb-2">Delete Promo Code?</h3>
            <p className="text-sm text-secondary mb-6">Are you sure you want to delete this promo code? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setPromoToDelete(null)} className="px-4 py-2 text-sm text-secondary bg-base border border-divider rounded-lg hover:text-primary cursor-pointer transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 cursor-pointer transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
