import React from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Eye, Sparkles } from "lucide-react";


export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { displayOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
            Catalog Inventory
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
            Product Formulations ({products.length})
          </h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Manage supplements, pricing, ingredients, flavor variants, and inventory.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1b3b2c] text-white font-semibold text-xs rounded-xl hover:bg-[#25513d] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Product Formulation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Variants / SKUs</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3eee3]">
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                const primaryImg = p.images[0]?.url || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80";

                return (
                  <tr key={p.id} className="hover:bg-[#fbf9f5]/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg bg-[#fbf9f5] border border-[#e6dfd3] overflow-hidden flex-shrink-0">
                          <Image
                            src={primaryImg}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#141716]">{p.name}</p>
                          <p className="text-[11px] text-[#85958d]">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-[#2b322f]">
                      {p.category.name}
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-[#1b3b2c]">
                      {formatPrice(p.basePrice)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#141716]">{p.variants.length}</span>{" "}
                      <span className="text-[#85958d]">
                        ({p.variants.map((v) => v.flavor || v.weight).filter(Boolean).slice(0, 2).join(", ") || "Standard"})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          totalStock === 0
                            ? "bg-rose-100 text-rose-800"
                            : totalStock <= 15
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {totalStock} in stock
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-gray-500 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Archived</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#5c6b64] hover:text-[#1b3b2c] hover:bg-[#f3eee3] rounded"
                          title="View on storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="px-3 py-1 bg-[#f3eee3] text-[#1b3b2c] font-semibold text-xs rounded hover:bg-[#1b3b2c] hover:text-white transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
