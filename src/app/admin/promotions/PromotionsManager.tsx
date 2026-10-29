"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Tag, Plus, Trash2, Check, AlertCircle } from "lucide-react";

interface DiscountRow {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  value: number;
  minimumOrderAmount: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  _count?: { redemptions: number };
}

export function PromotionsManager({ initialDiscounts }: { initialDiscounts: DiscountRow[] }) {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<DiscountRow[]>(initialDiscounts);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState<number>(10);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(2000);
  const [maxUses, setMaxUses] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          discountType,
          value: Number(value),
          minimumOrderAmount: Number(minimumOrderAmount),
          maxUses: maxUses ? Number(maxUses) : null,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDiscounts([data.discount, ...discounts]);
        setShowAddForm(false);
        setCode("");
        setDescription("");
        setMessage({ text: `Coupon '${data.discount.code}' created successfully!`, isError: false });
        router.refresh();
      } else {
        setMessage({ text: data.message || "Failed to create discount.", isError: true });
      }
    } catch {
      setMessage({ text: "Error creating coupon.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, discountCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${discountCode}'?`)) return;

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setDiscounts(discounts.filter((d) => d.id !== id));
        setMessage({ text: `Coupon '${discountCode}' deleted.`, isError: false });
      }
    } catch {
      setMessage({ text: "Error deleting coupon.", isError: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#e6dfd3]">
        <div className="flex items-center space-x-2 text-xs text-[#5c6b64]">
          <Tag className="w-4 h-4 text-[#1b3b2c]" />
          <span>Active Coupons & Automated Rules</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-4 py-2 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            message.isError
              ? "bg-rose-50 border border-rose-200 text-rose-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          {message.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Creation Modal / Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateDiscount}
          className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4 text-xs"
        >
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
            New Promotional Discount Code
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#141716] mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MONSOON20"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              >
                <option value="PERCENTAGE">Percentage (%) Off</option>
                <option value="FIXED_AMOUNT">Fixed Rupee (Rs.) Amount Off</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">
                Value ({discountType === "PERCENTAGE" ? "%" : "Rs."}) *
              </label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="10"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Minimum Order Amount (Rs.)</label>
              <input
                type="number"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                placeholder="2000"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Max Total Uses (Optional)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#141716] mb-1">Description / Campaign Purpose</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 10% discount for community crossfitters"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-[#e6dfd3] text-[#5c6b64] font-semibold rounded-lg hover:bg-[#fbf9f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d] disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Coupon"}
            </button>
          </div>
        </form>
      )}

      {/* Existing Coupons Table */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min. Spend</th>
                <th className="py-3 px-4">Usage Counter</th>
                <th className="py-3 px-4">Campaign Info</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3eee3]">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-[#fbf9f5]/70">
                  <td className="py-3 px-4 font-mono font-bold text-[#1b3b2c] text-sm">
                    {d.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#141716]">
                    {d.discountType === "PERCENTAGE" ? `${d.value}% Off` : `Rs. ${d.value} Flat Off`}
                  </td>
                  <td className="py-3 px-4 text-[#5c6b64]">
                    {formatPrice(d.minimumOrderAmount)}
                  </td>
                  <td className="py-3 px-4 text-[#141716]">
                    <strong>{d.usedCount}</strong> {d.maxUses ? `/ ${d.maxUses} uses` : "uses (unlimited)"}
                  </td>
                  <td className="py-3 px-4 text-[#5c6b64]">
                    {d.description || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] rounded-full ${
                        d.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {d.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.code)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
