"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    subtitle?: string | null;
    basePrice: number;
    compareAtPrice?: number | null;
    packageSize?: string | null;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    category?: { name: string; slug: string };
    images: { url: string; altText?: string | null }[];
    variants?: { id: string; name: string; flavor?: string | null; stock: number }[];
    reviews?: { rating: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0]?.url || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80";
  const hoverImage = product.images[1]?.url || primaryImage;

  // Calculate review score
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  // Stock check across variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 10;
  const isOutOfStock = totalStock <= 0;

  // Savings calculation
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.basePrice) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="group relative bg-white border border-[#e6dfd3] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#141716] text-white rounded-md">
            Out of Stock
          </span>
        ) : (
          <>
            {product.isBestseller && (
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#1b3b2c] text-white rounded-md">
                Bestseller
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#b87328] text-white rounded-md">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-800 text-white rounded-md">
                Save {discountPercent}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Image Container with Link */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-[#fbf9f5] overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}
      </Link>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5c6b64] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-[#8c571e]">
              {product.category?.name || "Pure Supplement"}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-[#c98a3b] text-[#c98a3b]" />
              <span className="font-semibold text-[#141716] text-[11px]">{avgRating}</span>
              <span className="text-[10px] text-[#85958d]">({reviews.length || 2})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-base font-semibold text-[#141716] group-hover:text-[#1b3b2c] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Package size */}
          <p className="text-xs text-[#5c6b64] mt-1 line-clamp-2 min-h-[32px]">
            {product.subtitle || product.packageSize || "Cold-processed formulation for clean athletic performance."}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-[#f3eee3] flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-lg font-bold text-[#1b3b2c]">
                {formatPrice(product.basePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#85958d] line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
            {product.packageSize && (
              <span className="text-[10px] text-[#85958d] block">
                {product.packageSize.split("/")[0]}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="px-3.5 py-1.5 bg-[#f3eee3] text-[#1b3b2c] hover:bg-[#1b3b2c] hover:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Select Options
          </Link>
        </div>
      </div>
    </div>
  );
}
