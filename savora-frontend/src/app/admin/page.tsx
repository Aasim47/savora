"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/currency";
import api from "@/lib/axios";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/orders")
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.slice(0, 5)); // Just recent 5
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-primary mb-2">Dashboard Overview</h1>
        <p className="text-secondary">Track platform performance and recent activity.</p>
      </div>

      {/* KPI Cards (Asymmetric Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {/* Revenue Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface p-6 md:p-8 rounded-[14px] flex flex-col justify-between min-h-[200px] border border-divider">
          <div className="flex justify-between items-start mb-8">
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Total Revenue (Delivered)</span>
          </div>
          <div>
            <div className="font-serif text-5xl md:text-6xl text-primary tracking-tight mb-2">{formatCurrency(stats?.totalRevenue || 0)}</div>
          </div>
        </div>

        {/* Normal KPI */}
        <div className="bg-surface p-6 rounded-[14px] flex flex-col justify-between min-h-[200px] border border-divider">
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-6">Total Orders</span>
          <div>
            <div className="font-serif text-4xl text-primary tracking-tight mb-2">{stats?.totalOrders || 0}</div>
          </div>
        </div>

        {/* Normal KPI */}
        <div className="bg-surface p-6 rounded-[14px] flex flex-col justify-between min-h-[200px] border border-divider">
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-6">Active Restaurants</span>
          <div>
            <div className="font-serif text-4xl text-primary tracking-tight mb-2">{stats?.totalRestaurants || 0}</div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {stats?.analytics && (
        <div className="bg-surface p-6 md:p-8 rounded-[14px] border border-divider mb-12">
          <h2 className="text-lg font-medium text-primary mb-6">Revenue Over Time (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.analytics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--secondary)' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 12, fill: 'var(--secondary)' }} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--divider)', borderRadius: '8px', color: 'var(--primary)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--secondary)', marginBottom: '4px' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-primary">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline cursor-pointer">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-4 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Order ID</th>
                <th className="pb-4 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Customer</th>
                <th className="pb-4 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Restaurant</th>
                <th className="pb-4 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Amount</th>
                <th className="pb-4 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-secondary">No recent orders</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-divider/60 hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-primary font-medium">{order.id.split('-')[0]}</td>
                    <td className="py-4 px-4 text-sm text-secondary">{order.customerName || order.user?.name || "Unknown"}</td>
                    <td className="py-4 px-4 text-sm text-secondary">{order.restaurant?.name || "Unknown"}</td>
                    <td className="py-4 px-4 text-sm text-primary font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full",
                        order.status === "PENDING" ? "bg-[#FEF3C7]/50 text-[#92400E] dark:bg-amber-900/40 dark:text-amber-400" :
                        order.status === "PREPARING" ? "bg-[#DBEAFE]/50 text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-400" :
                        order.status === "DELIVERED" ? "bg-[#D1FAE5]/50 text-[#065F46] dark:bg-emerald-900/40 dark:text-emerald-400" :
                        "bg-surface border border-divider text-secondary dark:bg-surface/50 dark:text-secondary/80"
                      )}>
                        {order.status}
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
  );
}
