"use client";

import { LayoutDashboard, Store, ShoppingBag, Users, Settings, LogOut, Menu, X, Tag, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { OrderNotificationProvider, useNotifications } from "@/components/admin/OrderNotificationProvider";
import { TOKEN_KEY_ADMIN } from "@/lib/axios";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { pendingCount } = useNotifications();
  const router = useRouter();

  const handleAdminLogout = () => {
    localStorage.removeItem(TOKEN_KEY_ADMIN);
    router.push("/login?role=admin");
  };

  const mainMargin = collapsed ? "md:ml-[72px]" : "md:ml-[240px]";

  const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? label : undefined}
        className={cn(
          "flex items-center gap-3 py-2.5 text-sm transition-colors relative group",
          active ? "text-[#F5EFE6] font-medium" : "text-[#F5EFE6]/70 hover:text-[#F5EFE6] hover:bg-white/5",
          active && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#C9622A]",
          collapsed ? "px-0 justify-center rounded-lg mx-2" : "pl-4 pr-4 rounded-r-lg rounded-l-none"
        )}
      >
        <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "stroke-[2]" : "stroke-[1.5]")} />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="min-w-[20px] h-5 flex items-center justify-center bg-accent text-white text-[10px] font-bold rounded-full px-1.5">
            {badge}
          </span>
        )}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-accent text-white text-[9px] font-bold rounded-full px-1">
            {badge}
          </span>
        )}
        {/* Tooltip on collapsed hover */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#2B2A27] text-[#F5EFE6] text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="ml-1.5 text-accent">({badge})</span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed to viewport */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-[#2F4F3E] text-[#F5EFE6] flex flex-col transition-all duration-300 ease-in-out",
          // On mobile: always full width (240px) when opened, hidden when closed
          // On desktop: use collapsed state width
          mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full",
          // Desktop overrides: always visible, use collapsed width
          collapsed ? "md:translate-x-0 md:w-[72px]" : "md:translate-x-0 md:w-[240px]"
        )}
      >
        {/* Logo / Header */}
        <div className={cn("flex items-center justify-between border-b border-white/5", collapsed ? "p-4" : "p-6")}>
          {!collapsed && (
            <Link href="/admin" className="font-serif text-xl tracking-tight text-[#F5EFE6] truncate">
              Bhojanwale
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="font-serif text-lg tracking-tight text-[#F5EFE6] mx-auto" title="Bhojanwale Admin">
              B
            </Link>
          )}
          <button className="md:hidden text-[#F5EFE6]/70 hover:text-[#F5EFE6]" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6">
          <div>
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-semibold text-[#F5EFE6]/50 uppercase tracking-widest mb-3">
                Analytics
              </h3>
            )}
            <div className="space-y-1">
              <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
            </div>
          </div>

          {collapsed && <div className="h-px bg-white/10 mx-3" />}

          <div>
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-semibold text-[#F5EFE6]/50 uppercase tracking-widest mb-3">
                Management
              </h3>
            )}
            <div className="space-y-1">
              <NavItem href="/admin/orders" icon={ShoppingBag} label="Orders" badge={pendingCount} />
              <NavItem href="/admin/restaurants" icon={Store} label="Restaurants" />
              <NavItem href="/admin/users" icon={Users} label="Users" />
              <NavItem href="/admin/promos" icon={Tag} label="Promo Codes" />
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10">
          <div className={cn("space-y-1", collapsed ? "py-3" : "p-4")}>
            <NavItem href="/admin/settings" icon={Settings} label="Settings" />
            <button
              onClick={handleAdminLogout}
              title={collapsed ? "Logout" : undefined}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 text-sm text-[#E0824A] hover:bg-white/5 transition-colors cursor-pointer group relative",
                collapsed ? "justify-center px-0 rounded-lg mx-2" : "px-4 rounded-r-lg"
              )}
            >
              <LogOut className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
              {!collapsed && "Logout"}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#2B2A27] text-[#E0824A] text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>
          </div>

          {/* Collapse toggle — desktop only */}
          <div className="hidden md:flex border-t border-white/10 p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 text-[#F5EFE6]/50 hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer rounded-lg text-xs"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronsLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content — offset by sidebar width, scrolls independently */}
      <div className={cn("flex flex-col min-h-screen transition-all duration-300 ease-in-out", mainMargin)}>
        {/* Mobile header */}
        <header className="h-16 border-b border-divider flex items-center px-4 md:hidden bg-base sticky top-0 z-30">
          <button className="text-primary p-2 cursor-pointer" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="font-serif text-lg ml-2 text-primary">Bhojanwale</Link>
        </header>
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderNotificationProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </OrderNotificationProvider>
  );
}
