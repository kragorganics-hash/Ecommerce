"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Check,
  ShieldCheck,
  Truck,
  Leaf,
  Plus,
  Minus,
  ShoppingBag,
  Info,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/features/cart/CartContext";
import { ProductCard } from "@/components/catalog/ProductCard";

interface Variant {
  id: string;
  name: string;
  flavor?: string | null;
  weight?: string | null;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
}

interface ProductViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
}

export function ProductView({ product, relatedProducts }: ProductViewProps) {
  const { addItem } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "usage" | "reviews">("overview");
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [reviewErrorMsg, setReviewErrorMsg] = useState("");
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);

  const variants: Variant[] = product.variants || [];
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const currentPrice = activeVariant?.price ?? product.basePrice;
  const comparePrice = activeVariant?.compareAtPrice ?? product.compareAtPrice;
  const currentStock = activeVariant?.stock ?? 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const images = product.images.length > 0 ? product.images : [{ url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80" }];
  const currentImage = images[selectedImageIndex]?.url || images[0].url;

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;

    addItem(
      {
        variantId: activeVariant.id,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variantName: activeVariant.name,
        flavor: activeVariant.flavor,
        weight: activeVariant.weight,
        sku: activeVariant.sku,
        price: activeVariant.price,
        compareAtPrice: activeVariant.compareAtPrice,
        image: currentImage,
        maxStock: activeVariant.stock,
      },
      quantity
    );

    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewAuthor.trim()) return;

    setIsSubmittingReview(true);
    setReviewSuccessMsg("");
    setReviewErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          authorName: reviewAuthor,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSuccessMsg("Thank you! Your review has been submitted.");
        setReviewsList((prev) => [data.review, ...prev]);
        setReviewAuthor("");
        setReviewTitle("");
        setReviewComment("");
      } else {
        setReviewErrorMsg(data.message || "Failed to submit review.");
      }
    } catch {
      setReviewErrorMsg("Error submitting review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "5.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#5c6b64] flex items-center space-x-2">
        <Link href="/" className="hover:text-[#1b3b2c]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#1b3b2c]">Supplements</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#1b3b2c]">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#141716] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Section: Gallery + Purchasing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover object-center"
            />
            {comparePrice && comparePrice > currentPrice && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-800 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                Save {Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}%
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: { url: string; altText?: string }, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#1b3b2c] ring-2 ring-[#1b3b2c]/20"
                      : "border-[#e6dfd3] hover:border-[#85958d]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Rating, Variant Selector, Stock, Add to Cart */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              {product.category?.name || "Pure Formulation"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141716] mt-1">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="text-xs sm:text-sm text-[#5c6b64] mt-1.5 leading-relaxed">
                {product.subtitle}
              </p>
            )}

            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex text-[#c98a3b]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(avgRating))
                        ? "fill-[#c98a3b] text-[#c98a3b]"
                        : "text-[#e6dfd3]"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-xs text-[#141716]">{avgRating}</span>
              <span className="text-xs text-[#5c6b64]">
                ({reviewsList.length} verified sample reviews)
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl flex items-baseline space-x-3">
            <span className="font-serif text-3xl font-bold text-[#1b3b2c]">
              {formatPrice(currentPrice)}
            </span>
            {comparePrice && comparePrice > currentPrice && (
              <span className="text-sm text-[#85958d] line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
            <span className="text-xs text-[#5c6b64] ml-auto">
              Taxes included | Free shipping &gt; Rs. 3,500
            </span>
          </div>

          {/* Variant Selector (Flavor / Size / Weight) */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#141716]">
                <span>Choose Option / Flavor & Weight:</span>
                <span className="text-[#8c571e]">{activeVariant?.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const isVarOutOfStock = v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isVarOutOfStock}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                          : "border-[#e6dfd3] bg-white hover:bg-[#fbf9f5]"
                      } ${isVarOutOfStock ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                    >
                      <div className="font-semibold text-[#141716] flex items-center justify-between">
                        <span>{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1b3b2c]" />}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[#5c6b64]">
                        <span>{formatPrice(v.price)}</span>
                        {isVarOutOfStock ? (
                          <span className="text-rose-600 font-bold text-[10px]">Sold Out</span>
                        ) : v.stock <= 5 ? (
                          <span className="text-amber-700 font-medium text-[10px]">{v.stock} left</span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[10px]">In Stock</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            {isOutOfStock ? (
              <span className="flex items-center space-x-1.5 text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Currently out of stock. Check back shortly.</span>
              </span>
            ) : isLowStock ? (
              <span className="flex items-center space-x-1.5 text-amber-700 font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Low stock: Only {currentStock} units remaining in this batch</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>In Stock — Fresh batch ready to ship immediately</span>
              </span>
            )}
          </div>

          {/* Quantity Stepper & Add to Cart Button */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-[#e6dfd3] rounded-xl bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-[#5c6b64] hover:text-[#141716] disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-semibold text-sm text-[#141716] min-w-[28px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="p-2 text-[#5c6b64] hover:text-[#141716] disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock ? "Out of Stock" : `Add to Cart • ${formatPrice(currentPrice * quantity)}`}
                </span>
              </button>
            </div>

            {isAddedSuccess && (
              <div className="p-3 bg-[#e8f0eb] border border-[#b5d5c5] rounded-xl text-xs text-[#1b3b2c] font-semibold flex items-center space-x-2 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Added to your cart! Review drawer or proceed to checkout.</span>
              </div>
            )}
          </div>

          {/* Value Props & Shipping Notice */}
          <div className="p-4 bg-white border border-[#e6dfd3] rounded-xl space-y-2.5 text-xs text-[#5c6b64]">
            <div className="flex items-center space-x-2.5">
              <Truck className="w-4 h-4 text-[#1b3b2c] flex-shrink-0" />
              <span>Reliable domestic delivery across all 7 provinces of Nepal</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1b3b2c] flex-shrink-0" />
              <span>Encrypted server-verified payment (eSewa, Khalti, COD, Sandbox)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Leaf className="w-4 h-4 text-[#1b3b2c] flex-shrink-0" />
              <span>Pure organic botanical ingredients & zero undisclosed fillers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Overview, Clean Ingredients, Usage & Directions, Customer Reviews */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-[#e6dfd3] bg-[#fbf9f5] overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#1b3b2c] text-[#1b3b2c] bg-white"
                : "border-transparent text-[#5c6b64] hover:text-[#141716]"
            }`}
          >
            Overview & Benefits
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "ingredients"
                ? "border-[#1b3b2c] text-[#1b3b2c] bg-white"
                : "border-transparent text-[#5c6b64] hover:text-[#141716]"
            }`}
          >
            Ingredients & Sourcing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("usage")}
            className={`px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "usage"
                ? "border-[#1b3b2c] text-[#1b3b2c] bg-white"
                : "border-transparent text-[#5c6b64] hover:text-[#141716]"
            }`}
          >
            Usage & Nutrition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "reviews"
                ? "border-[#1b3b2c] text-[#1b3b2c] bg-white"
                : "border-transparent text-[#5c6b64] hover:text-[#141716]"
            }`}
          >
            Verified Reviews ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          {activeTab === "overview" && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-xl font-bold text-[#141716]">
                Formulation Architecture
              </h3>
              <p className="text-sm text-[#2b322f] leading-relaxed">
                {product.description}
              </p>
              {product.packageSize && (
                <div className="mt-4 p-3 bg-[#f3eee3] rounded-lg text-xs text-[#2b322f] inline-block">
                  <strong>Standard Package Sizing:</strong> {product.packageSize}
                </div>
              )}
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-xl font-bold text-[#141716]">
                Full Ingredient Transparency
              </h3>
              <p className="text-sm text-[#2b322f] leading-relaxed bg-[#fbf9f5] p-4 rounded-xl border border-[#e6dfd3]">
                {product.ingredients || "100% pure single ingredient formulation without undisclosed excipients."}
              </p>

              {product.allergens && (
                <div className="p-4 bg-[#fdf8f0] border border-[#faebd7] rounded-xl text-xs text-[#8c571e] flex items-start space-x-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Allergen & Verification Notice:</strong>
                    <p className="mt-0.5">{product.allergens}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "usage" && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-xl font-bold text-[#141716]">
                Recommended Directions
              </h3>
              <p className="text-sm text-[#2b322f] leading-relaxed">
                {product.suggestedUsage || "Consume according to the labeled serving size with cold water or fresh smoothie."}
              </p>

              {/* Strict Disclaimer per instructions */}
              <div className="p-4 bg-[#f8f5ee] border border-[#e6dfd3] rounded-xl text-xs text-[#5c6b64] space-y-1">
                <p className="font-semibold text-[#141716]">
                  Regulatory & Verification Disclosure
                </p>
                <p>
                  Mark placeholder nutritional information for commercial laboratory verification before retail launch. This sample formulation does not replace a balanced whole-food diet. Never exceed labeled dosages.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#141716]">
                  Customer Experiences
                </h3>

                <div className="divide-y divide-[#e6dfd3]">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="py-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-[#141716]">
                            {rev.authorName}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] font-bold text-[#1b3b2c] bg-[#e8f0eb] px-2 py-0.5 rounded">
                              Verified Purchaser
                            </span>
                          )}
                        </div>
                        <div className="flex text-[#c98a3b]">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-xs">
                              {i < rev.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                      {rev.title && (
                        <p className="font-semibold text-xs text-[#2b322f]">{rev.title}</p>
                      )}
                      <p className="text-xs text-[#5c6b64] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Review Form */}
              <div className="p-6 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl max-w-xl">
                <h4 className="font-serif text-base font-bold text-[#141716] mb-1">
                  Share Your Experience
                </h4>
                <p className="text-xs text-[#5c6b64] mb-4">
                  Help fellow athletes understand how this formulation performs for you.
                </p>

                <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#141716] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Maya Shrestha"
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#141716] mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                    >
                      <option value={5}>5 Stars - Outstanding</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2}>2 Stars - Below Expectations</option>
                      <option value={1}>1 Star - Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#141716] mb-1">Headline (Optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Great solubility and clean flavor"
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#141716] mb-1">Your Comments</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d] disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>

                  {reviewSuccessMsg && (
                    <p className="text-emerald-700 font-semibold">{reviewSuccessMsg}</p>
                  )}
                  {reviewErrorMsg && (
                    <p className="text-rose-600 font-semibold">{reviewErrorMsg}</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
                Complementary Formulations
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#141716] mt-1">
                Frequently Paired With
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-[#1b3b2c] hover:underline"
            >
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
