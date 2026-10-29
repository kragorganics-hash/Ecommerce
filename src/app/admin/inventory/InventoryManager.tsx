"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, PlusCircle, AlertTriangle, Check, AlertCircle } from "lucide-react";

interface VariantRow {
  id: string;
  name: string;
  flavor?: string | null;
  sku: string;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export function InventoryManager({ initialVariants }: { initialVariants: VariantRow[] }) {
  const router = useRouter();

  const [variants, setVariants] = useState<VariantRow[]>(initialVariants);
  const [filterLowOnly, setFilterLowOnly] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantRow | null>(null);

  // Modal State
  const [changeQuantity, setChangeQuantity] = useState<number>(20);
  const [reason, setReason] = useState<"RESTOCK" | "DAMAGE" | "ADJUSTMENT" | "RETURN">("RESTOCK");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const displayedVariants = filterLowOnly
    ? variants.filter((v) => v.stock <= 20)
    : variants;

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          changeQuantity: Number(changeQuantity),
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVariants((prev) =>
          prev.map((v) =>
            v.id === selectedVariant.id ? { ...v, stock: data.newStock } : v
          )
        );
        setMessage({ text: `Stock updated to ${data.newStock} units.`, isError: false });
        setSelectedVariant(null);
        setNotes("");
        router.refresh();
      } else {
        setMessage({ text: data.message || "Failed to update stock.", isError: true });
      }
    } catch {
      setMessage({ text: "Error adjusting stock.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e6dfd3]">
        <div className="flex items-center space-x-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer font-semibold text-[#141716]">
            <input
              type="checkbox"
              checked={filterLowOnly}
              onChange={(e) => setFilterLowOnly(e.target.checked)}
              className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
            />
            <span>Show Low Stock Only (&le; 20 units)</span>
          </label>
        </div>

        <span className="text-xs text-[#5c6b64]">
          Showing <strong>{displayedVariants.length}</strong> active inventory SKUs
        </span>
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

      {/* SKUs Table */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Supplement Formulation</th>
                <th className="py-3 px-4">Variant & Flavor</th>
                <th className="py-3 px-4">SKU Reference</th>
                <th className="py-3 px-4">Stock on Hand</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3eee3]">
              {displayedVariants.map((v) => (
                <tr key={v.id} className="hover:bg-[#fbf9f5]/70">
                  <td className="py-3 px-4 font-semibold text-[#141716]">
                    {v.product.name}
                  </td>
                  <td className="py-3 px-4 text-[#2b322f]">
                    {v.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#5c6b64]">
                    {v.sku}
                  </td>
                  <td className="py-3 px-4 font-bold text-sm text-[#141716]">
                    {v.stock}
                  </td>
                  <td className="py-3 px-4">
                    {v.stock === 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">
                        Out of Stock
                      </span>
                    ) : v.stock <= 15 ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-medium rounded text-[10px]">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setChangeQuantity(20);
                        setReason("RESTOCK");
                      }}
                      className="px-3 py-1 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d] transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="border-b border-[#f3eee3] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#141716]">
                Adjust Inventory Level
              </h3>
              <p className="text-xs text-[#5c6b64] mt-0.5">
                {selectedVariant.product.name} &bull; <strong>{selectedVariant.name}</strong> ({selectedVariant.sku})
              </p>
              <p className="text-xs text-[#1b3b2c] font-semibold mt-1">
                Current Stock: {selectedVariant.stock} units
              </p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#141716] mb-1">
                  Quantity Change (+ for additions, - for deductions)
                </label>
                <input
                  type="number"
                  required
                  value={changeQuantity}
                  onChange={(e) => setChangeQuantity(Number(e.target.value))}
                  placeholder="e.g. +25 or -5"
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg text-sm font-semibold"
                />
                <span className="text-[10px] text-[#85958d] mt-1 block">
                  Resulting Stock Level: <strong>{Math.max(0, selectedVariant.stock + Number(changeQuantity))}</strong> units
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">Reason for Adjustment</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
                >
                  <option value="RESTOCK">Restock (Received Batch from Laboratory)</option>
                  <option value="DAMAGE">Damaged / Expired Container Write-off</option>
                  <option value="ADJUSTMENT">Manual Inventory Audit Count Correction</option>
                  <option value="RETURN">Customer Return / Exchange</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">Notes / Invoice Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Batch #491 arrival from organic warehouse"
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2 border border-[#e6dfd3] font-semibold rounded-lg hover:bg-[#fbf9f5] text-[#5c6b64]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d] disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
