"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, X } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  categories: CategoryOption[];
  totalProducts: number;
}

export function FilterBar({ categories, totalProducts }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentQuery = searchParams.get("q") || "";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = currentCategory || currentInStock || currentQuery || currentSort !== "featured";

  return (
    <div className="bg-white border border-[#e6dfd3] rounded-xl p-4 sm:p-5 mb-8 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateFilter("category", null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              !currentCategory
                ? "bg-[#1b3b2c] text-white"
                : "bg-[#fbf9f5] text-[#2b322f] border border-[#e6dfd3] hover:bg-[#f3eee3]"
            }`}
          >
            All Categories
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => updateFilter("category", c.slug)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentCategory === c.slug
                  ? "bg-[#1b3b2c] text-white"
                  : "bg-[#fbf9f5] text-[#2b322f] border border-[#e6dfd3] hover:bg-[#f3eee3]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort & In-Stock Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* In-Stock Toggle */}
          <label className="flex items-center space-x-2 text-xs font-medium text-[#2b322f] cursor-pointer bg-[#fbf9f5] px-3 py-1.5 border border-[#e6dfd3] rounded-lg hover:bg-[#f3eee3]">
            <input
              type="checkbox"
              checked={currentInStock}
              onChange={(e) => updateFilter("inStock", e.target.checked ? "true" : null)}
              className="rounded text-[#1b3b2c] focus:ring-[#1b3b2c]"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 text-xs text-[#5c6b64]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="bg-[#fbf9f5] border border-[#e6dfd3] text-[#141716] text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Formulations</option>
            </select>
          </div>

          {/* Clear button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-xs text-rose-700 hover:text-rose-900 font-semibold px-2 py-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="mt-3 pt-3 border-t border-[#f3eee3] flex items-center justify-between text-xs text-[#5c6b64]">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#8c571e]" />
          <span>
            Showing <strong className="text-[#141716]">{totalProducts}</strong> products
            {currentQuery && (
              <>
                {" "}for query &ldquo;<strong className="text-[#141716]">{currentQuery}</strong>&rdquo;
              </>
            )}
          </span>
        </div>
        {currentCategory && (
          <span className="text-[11px] text-[#8c571e] font-medium">
            Category: {categories.find((c) => c.slug === currentCategory)?.name}
          </span>
        )}
      </div>
    </div>
  );
}
