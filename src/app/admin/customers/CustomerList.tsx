"use client";

import React, { useState } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Search, UserCheck } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string | Date;
  orders: { id: string; total: number; paymentStatus: string }[];
}

export function CustomerList({ initialCustomers }: { initialCustomers: CustomerItem[] }) {
  const [customers] = useState<CustomerItem[]>(initialCustomers);
  const [query, setQuery] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone && c.phone.includes(query))
  );

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e6dfd3] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
          <input
            type="text"
            placeholder="Search member name, email, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
          />
        </div>
        <span className="text-xs text-[#5c6b64]">
          <strong>{filtered.length}</strong> registered members
        </span>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <p className="text-xs text-[#5c6b64] py-12 text-center">
            No customers match your query.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eee3]">
                {filtered.map((c) => {
                  const paidSpend = c.orders
                    .filter((o) => o.paymentStatus === "PAID")
                    .reduce((sum, o) => sum + o.total, 0);

                  return (
                    <tr key={c.id} className="hover:bg-[#fbf9f5]/70">
                      <td className="py-3 px-4 font-semibold text-[#141716] flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#e8f0eb] text-[#1b3b2c] flex items-center justify-center font-bold text-[11px]">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </td>

                      <td className="py-3 px-4 text-[#5c6b64]">{c.email}</td>

                      <td className="py-3 px-4 text-[#5c6b64]">{c.phone || "—"}</td>

                      <td className="py-3 px-4 text-[#85958d]">{formatDate(c.createdAt)}</td>

                      <td className="py-3 px-4 font-semibold text-[#141716]">
                        {c.orders.length} orders
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-bold text-[#1b3b2c]">
                        {formatPrice(paidSpend)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
