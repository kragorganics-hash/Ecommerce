import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FilterBar } from "@/features/catalog/FilterBar";
import { Sparkles, PackageX } from "lucide-react";


interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;

  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const searchQuery = typeof searchParams.q === "string" ? searchParams.q.trim() : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "featured";
  const inStockOnly = searchParams.inStock === "true";

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { subtitle: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { ingredients: { contains: searchQuery } },
    ];
  }

  // Build order by clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  if (sort === "price-asc") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { basePrice: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  // Fetch categories and products in parallel
  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: true,
      },
    }),
  ]);

  // Client-side in-stock filter if requested
  const filteredProducts = inStockOnly
    ? products.filter((p) => p.variants.some((v) => v.stock > 0))
    : products;

  const activeCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs text-[#8c571e] font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Product Catalog</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716]">
          {activeCategoryName ? activeCategoryName : "All Formulations & Supplements"}
        </h1>
        <p className="text-sm text-[#5c6b64] mt-2 max-w-2xl leading-relaxed">
          Explore our complete lineup of clean proteins, micronized strength enhancers, unadulterated pre-workouts, and pure Himalayan wellness tonics.
        </p>
      </div>

      {/* Filter and Sorting Toolbar */}
      <FilterBar categories={categories} totalProducts={filteredProducts.length} />

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#f3eee3] text-[#5c6b64] flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#141716] mb-2">
            No supplements matched your criteria
          </h2>
          <p className="text-xs text-[#5c6b64] mb-6 leading-relaxed">
            Try adjusting your search keywords, clearing selected category filters, or toggling off the in-stock restriction.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d] transition-colors"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
