"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    discountAmount,
    shippingFee,
    total,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 3500;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoMessage(null);
    const result = await applyPromoCode(promoInput.trim());
    setIsApplyingPromo(false);

    if (result.success) {
      setPromoMessage({ text: result.message, isError: false });
      setPromoInput("");
    } else {
      setPromoMessage({ text: result.message, isError: true });
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fbf9f5] border-l border-[#e6dfd3] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e6dfd3] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#1b3b2c]" />
              <h2 className="font-serif text-lg font-bold text-[#141716]">
                Your Cart ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-[#5c6b64] hover:text-[#141716] rounded-full hover:bg-[#f3eee3] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3 bg-[#f2f7f4] border-b border-[#e6dfd3] text-xs">
            {amountToFreeShipping > 0 ? (
              <p className="text-[#1b3b2c] font-medium mb-1.5">
                Add <span className="font-bold">{formatPrice(amountToFreeShipping)}</span> more for <strong>Free Delivery</strong>
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1.5 flex items-center space-x-1">
                <span>🎉</span>
                <span>You unlocked Free Domestic Delivery!</span>
              </p>
            )}
            <div className="w-full bg-[#dcece3] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#1b3b2c] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#e6dfd3]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#f3eee3] flex items-center justify-center text-[#5c6b64] mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#141716] mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#5c6b64] max-w-xs mb-6">
                  Discover our pure botanical proteins, micronized creatine, and natural supplements.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    router.push("/products");
                  }}
                  className="px-6 py-2.5 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d] transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="py-4 flex space-x-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#e6dfd3] flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="font-medium text-sm text-[#141716] hover:text-[#1b3b2c] line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#85958d] hover:text-rose-600 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#5c6b64] mt-0.5">
                        {item.variantName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#e6dfd3] rounded-md bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 text-[#5c6b64] hover:text-[#141716]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#141716]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-[#5c6b64] hover:text-[#141716] disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#141716]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-[#85958d]">
                            {formatPrice(item.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e6dfd3] bg-white space-y-4">
              {/* Promo Code Input */}
              {discount ? (
                <div className="flex items-center justify-between p-2.5 bg-[#f2f7f4] border border-[#b5d5c5] rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-[#1b3b2c] font-medium">
                    <Tag className="w-3.5 h-3.5 text-[#1b3b2c]" />
                    <span>Promo: <strong>{discount.code}</strong> (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. KRAG10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#fbf9f5] border border-[#e6dfd3] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="px-3 py-1.5 bg-[#1b3b2c] text-white text-xs font-medium rounded-md hover:bg-[#25513d] disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </form>
                  {promoMessage && (
                    <p
                      className={`text-[11px] mt-1 ${
                        promoMessage.isError ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              )}

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-[#5c6b64]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#141716]">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-700">FREE</strong>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-[#f3eee3] pt-2 flex justify-between text-sm font-bold text-[#141716]">
                  <span>Estimated Total</span>
                  <span className="font-serif text-base text-[#1b3b2c]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 bg-[#1b3b2c] text-white font-semibold text-sm rounded-lg hover:bg-[#25513d] transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="block w-full py-2 text-center text-xs text-[#5c6b64] hover:text-[#141716] font-medium"
                >
                  View Full Cart Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
