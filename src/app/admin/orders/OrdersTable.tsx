"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Search, Filter, Eye } from "lucide-react";

interface OrderRow {
  id: string;
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  shippingCity: string;
  shippingState: string;
  total: number;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  createdAt: string | Date;
  items: { id: string; quantity: number }[];
}

export function OrdersTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders] = useState<OrderRow[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.guestName && o.guestName.toLowerCase().includes(search.toLowerCase())) ||
      (o.guestEmail && o.guestEmail.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e6dfd3] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
          <input
            type="text"
            placeholder="Search order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-[#5c6b64]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg text-xs"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[#5c6b64]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg text-xs"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <p className="text-xs text-[#5c6b64] py-12 text-center">
            No orders match the current filter selection.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eee3]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#fbf9f5]/70">
                    <td className="py-3 px-4 font-semibold text-[#1b3b2c]">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#141716]">{ord.guestName || "Customer"}</div>
                      <div className="text-[10px] text-[#85958d]">{ord.guestEmail}</div>
                      <div className="text-[10px] text-[#5c6b64]">{ord.shippingCity}</div>
                    </td>

                    <td className="py-3 px-4 text-[#5c6b64]">
                      {formatDate(ord.createdAt)}
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-[#141716]">
                      {formatPrice(ord.total)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-[#5c6b64]">
                        {ord.fulfillmentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-3 py-1 bg-[#f3eee3] text-[#1b3b2c] font-semibold rounded hover:bg-[#1b3b2c] hover:text-white transition-colors"
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
    </div>
  );
}
