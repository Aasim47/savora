"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/utils/cn";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading user profile...</div>;
  if (!user) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">User not found.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Profile Card */}
      <div className="bg-surface rounded-[14px] border border-divider p-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0">
            {(user.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-3xl text-primary mb-1">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className={cn(
                "inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full",
                user.role === "ADMIN" ? "bg-[#DBEAFE]/50 text-[#1E40AF]" : "bg-surface border border-divider text-secondary"
              )}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface rounded-[14px] border border-divider p-6">
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3 block">Total Orders</span>
          <p className="font-serif text-4xl text-primary">{user.totalOrders}</p>
        </div>
        <div className="bg-surface rounded-[14px] border border-divider p-6">
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3 block">Total Spend</span>
          <p className="font-serif text-4xl text-primary">{formatCurrency(user.totalSpend)}</p>
        </div>
        <div className="bg-surface rounded-[14px] border border-divider p-6">
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3 block">Avg Order Value</span>
          <p className="font-serif text-4xl text-primary">{formatCurrency(user.totalOrders > 0 ? user.totalSpend / user.totalOrders : 0)}</p>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-lg font-medium text-primary mb-6">Order History</h2>
        <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-divider bg-base/50">
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Date</th>
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Order ID</th>
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Restaurant</th>
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Items</th>
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Amount</th>
                  <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
                </tr>
              </thead>
              <tbody>
                {user.orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-secondary">No orders yet.</td></tr>
                ) : (
                  user.orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-divider/60 hover:bg-base/30 transition-colors">
                      <td className="py-4 px-6 text-sm text-secondary whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-primary">{order.id.split("-")[0]}</td>
                      <td className="py-4 px-6 text-sm text-primary">{order.restaurant?.name || "—"}</td>
                      <td className="py-4 px-6 text-sm text-secondary">{order.items?.length || 0} items</td>
                      <td className="py-4 px-6 text-sm font-medium text-primary">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full",
                          order.status === "PENDING" ? "bg-[#FEF3C7]/50 text-[#92400E]" :
                          order.status === "PREPARING" ? "bg-[#DBEAFE]/50 text-[#1E40AF]" :
                          order.status === "DELIVERED" ? "bg-[#D1FAE5]/50 text-[#065F46]" :
                          order.status === "CANCELLED" ? "bg-error/10 text-error" :
                          "bg-surface border border-divider text-secondary"
                        )}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
