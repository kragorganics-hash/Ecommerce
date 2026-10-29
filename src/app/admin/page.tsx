import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";


export default async function AdminOverviewPage() {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    paidOrders,
    lowStockVariants,
    recentOrders,
    recentAuditLogs,
  ] = await Promise.all([
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { total: true },
    }),
    db.productVariant.findMany({
      where: { stock: { lte: 20 }, isActive: true },
      include: { product: { select: { name: true, slug: true } } },
      take: 6,
      orderBy: { stock: "asc" },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true, payments: true },
    }),
    db.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      {/* Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
            Live Store Analytics
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Real-time database performance and inventory statistics for Krag Organic.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#1b3b2c] text-white font-semibold rounded-xl hover:bg-[#25513d] transition-colors"
          >
            + New Supplement
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-white border border-[#e6dfd3] font-semibold text-[#141716] rounded-xl hover:bg-[#fbf9f5]"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85958d]">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#1b3b2c]">
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-[10px] text-[#85958d] block mt-1">From verified paid orders</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85958d]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#141716]">
              {totalOrders}
            </span>
            <span className="text-[10px] text-[#85958d] block mt-1">All time orders placed</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85958d]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <Users className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#141716]">
              {totalCustomers}
            </span>
            <span className="text-[10px] text-[#85958d] block mt-1">Registered members</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85958d]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog</span>
            <Package className="w-4 h-4 text-[#8c571e]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#141716]">
              {totalProducts}
            </span>
            <span className="text-[10px] text-[#85958d] block mt-1">Formulations published</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85958d]">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-amber-700">
              {lowStockVariants.length}
            </span>
            <span className="text-[10px] text-[#85958d] block mt-1">SKUs with &le; 20 units</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee3] pb-4">
            <h2 className="font-serif text-lg font-bold text-[#141716]">
              Recent Customer Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#1b3b2c] hover:underline flex items-center space-x-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[#5c6b64] py-8 text-center">No customer orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3eee3]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#fbf9f5]">
                      <td className="py-3 font-semibold text-[#1b3b2c]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-[#141716]">{ord.guestName || "Customer"}</div>
                        <div className="text-[10px] text-[#85958d]">{ord.guestEmail}</div>
                      </td>
                      <td className="py-3 font-semibold text-[#141716]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-[#e8f0eb] text-[#1b3b2c] font-bold text-[10px] rounded-full">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 font-bold text-[10px] rounded-full ${
                            ord.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="px-2.5 py-1 bg-[#f3eee3] text-[#1b3b2c] font-semibold text-[11px] rounded hover:bg-[#1b3b2c] hover:text-white transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Low Stock Warnings */}
        <div className="lg:col-span-4 bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee3] pb-4">
            <h2 className="font-serif text-lg font-bold text-[#141716] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-[#1b3b2c] hover:underline"
            >
              Adjust
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <p className="text-xs text-emerald-700 py-6 text-center">
              All inventory levels are adequately stocked (&gt; 20 units).
            </p>
          ) : (
            <div className="divide-y divide-[#f3eee3]">
              {lowStockVariants.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#141716] truncate max-w-[180px]">
                      {v.product.name}
                    </p>
                    <p className="text-[11px] text-[#5c6b64]">
                      {v.name} ({v.sku})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {v.stock} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security & Audit Trail Highlight */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f3eee3] pb-4">
          <h2 className="font-serif text-lg font-bold text-[#141716] flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#1b3b2c]" />
            <span>Recent Administrative Operations Log</span>
          </h2>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-[#1b3b2c] hover:underline"
          >
            Full Audit Trail &rarr;
          </Link>
        </div>

        <div className="divide-y divide-[#f3eee3] text-xs">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1b3b2c]">{log.action}</span>
                <span className="text-[#85958d] ml-2">by {log.admin?.name || "System"}</span>
                {log.details && (
                  <span className="text-[#5c6b64] ml-2 font-mono text-[11px]">
                    {log.details.slice(0, 80)}
                  </span>
                )}
              </div>
              <span className="text-[#85958d]">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
