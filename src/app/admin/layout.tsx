import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  History,
  Store,
  ShieldCheck,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Strict server-enforced role-based access control
  if (!user || user.role !== "ADMIN") {
    redirect("/login?error=admin_access_required");
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory & Alerts", icon: Boxes },
    { href: "/admin/orders", label: "Orders & Fulfillment", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/promotions", label: "Discounts & Promo", icon: Tag },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
    { href: "/admin/audit-logs", label: "Security & Audit Logs", icon: History },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f6f0] text-[#141716]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#12281e] text-[#f2f7f4] flex flex-col flex-shrink-0 border-r border-[#1e4733] hidden md:flex">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1e4733] flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white p-1 border border-[#2d5c44] flex items-center justify-center">
              <Image
                src="/images/krag-logo.jpeg"
                alt="KRAG Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white block leading-none">
                KRAG
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#dcb36d] font-semibold">
                ADMIN PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[#b5d5c5] hover:text-white hover:bg-[#1a3d2c] transition-colors font-medium"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with Storefront Link & Admin Profile */}
        <div className="p-4 border-t border-[#1e4733] space-y-3">
          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#dcb36d] bg-[#1a3d2c] hover:bg-[#25513d] rounded-lg transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Open Public Storefront</span>
          </Link>

          <div className="px-3 py-2 text-xs bg-[#0f241a] rounded-lg flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#85958d] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Nav Header */}
        <header className="md:hidden bg-[#12281e] text-white p-4 flex items-center justify-between border-b border-[#1e4733]">
          <Link href="/admin" className="font-serif font-bold text-base">
            KRAG <span className="text-[#dcb36d] text-xs">ADMIN</span>
          </Link>
          <div className="flex items-center space-x-3 text-xs">
            <Link href="/" className="text-[#dcb36d] font-semibold">Storefront</Link>
            <Link href="/admin/orders" className="text-white">Orders</Link>
            <Link href="/admin/products" className="text-white">Products</Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
