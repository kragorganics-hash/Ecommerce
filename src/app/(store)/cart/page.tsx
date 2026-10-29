"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    discountAmount,
    shippingFee,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const freeShippingThreshold = 3500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setIsApplying(true);
    setPromoStatus(null);
    const res = await applyPromoCode(promoCodeInput.trim());
    setIsApplying(false);

    if (res.success) {
      setPromoStatus({ message: res.message, isError: false });
      setPromoCodeInput("");
    } else {
      setPromoStatus({ message: res.message, isError: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto bg-white border border-[#e6dfd3] rounded-2xl p-10 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#f3eee3] text-[#5c6b64] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#141716] mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-[#5c6b64] mb-6 leading-relaxed">
            Your shopping cart currently has no supplements. Browse our clean protein powders, micronized creatine, and natural wellness products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d] transition-colors"
          >
            <span>Explore All Formulations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#141716]">Shopping Cart</h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Review your chosen supplements before proceeding to secure checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 bg-[#f2f7f4] border-b border-[#e6dfd3] text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#1b3b2c] font-medium mb-1.5">
                Add <strong className="font-bold">{formatPrice(remainingForFreeShipping)}</strong> more to qualify for <strong>Free Delivery</strong>
              </p>
            ) : (
              <p className="text-emerald-800 font-bold mb-1.5">
                🎉 Congratulations! Your order qualifies for Free Domestic Delivery across Nepal.
              </p>
            )}
            <div className="w-full bg-[#dcece3] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#1b3b2c] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-[#e6dfd3]">
            {items.map((item) => (
              <div key={item.variantId} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#fbf9f5] border border-[#e6dfd3] flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-serif text-base font-semibold text-[#141716] hover:text-[#1b3b2c]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#5c6b64] mt-0.5">{item.variantName}</p>
                    <p className="text-xs font-semibold text-[#1b3b2c] mt-1 sm:hidden">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#e6dfd3] rounded-lg bg-[#fbf9f5]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-1.5 text-[#5c6b64] hover:text-[#141716]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-[#141716] min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 text-[#5c6b64] hover:text-[#141716] disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="hidden sm:block text-right min-w-[100px]">
                    <div className="font-serif text-base font-bold text-[#141716]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[10px] text-[#85958d]">
                        {formatPrice(item.price)} each
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 text-[#85958d] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#fbf9f5] border-t border-[#e6dfd3] flex justify-between items-center text-xs">
            <Link
              href="/products"
              className="text-[#1b3b2c] hover:underline font-semibold"
            >
              &larr; Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-rose-600 hover:text-rose-800 font-medium"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
            Order Summary
          </h2>

          {/* Promo code form */}
          <div>
            <label className="block text-xs font-semibold text-[#141716] mb-1.5">
              Have a Coupon Code?
            </label>
            {discount ? (
              <div className="flex items-center justify-between p-2.5 bg-[#f2f7f4] border border-[#b5d5c5] rounded-xl text-xs">
                <div className="flex items-center space-x-2 text-[#1b3b2c] font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon: <strong>{discount.code}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Code (e.g. KRAG10)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
                <button
                  type="submit"
                  disabled={isApplying || !promoCodeInput.trim()}
                  className="px-4 py-2 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d] disabled:opacity-50"
                >
                  {isApplying ? "..." : "Apply"}
                </button>
              </form>
            )}
            {promoStatus && (
              <p
                className={`text-[11px] mt-1.5 ${
                  promoStatus.isError ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {promoStatus.message}
              </p>
            )}
          </div>

          {/* Line by line breakdown */}
          <div className="space-y-2 text-xs text-[#5c6b64] border-t border-[#f3eee3] pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal ({itemCount})</span>
              <span className="font-semibold text-[#141716]">{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Delivery (Nepal)</span>
              <span>
                {shippingFee === 0 ? (
                  <strong className="text-emerald-700">FREE</strong>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Sales Tax / VAT</span>
              <span>Included</span>
            </div>

            <div className="border-t border-[#e6dfd3] pt-3 flex justify-between text-base font-bold text-[#141716]">
              <span>Final Total</span>
              <span className="font-serif text-xl text-[#1b3b2c]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="w-full py-3.5 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-[11px] text-[#85958d] flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1b3b2c]" />
            <span>Encrypted checkout. Supported: eSewa, Khalti, COD, Sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
}
