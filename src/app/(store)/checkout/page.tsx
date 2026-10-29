"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  AlertCircle,
  Tag,
  Wallet,
} from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, discountAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Contact & Delivery State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [state, setState] = useState("Bagmati Province");
  const [postalCode, setPostalCode] = useState("44600");
  const [country] = useState("Nepal");

  // Shipping & Payment Method
  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"ESEWA" | "KHALTI" | "COD" | "TEST_CARD">("ESEWA");
  const [orderNotes, setOrderNotes] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      setEmail((prev) => prev || user.email);
      setName((prev) => prev || user.name);

      // Fetch saved address if available
      fetch("/api/account/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile?.addresses?.length > 0) {
            const def = data.profile.addresses.find((a: { isDefaultShipping: boolean }) => a.isDefaultShipping) || data.profile.addresses[0];
            if (def) {
              setAddressLine1(def.addressLine1);
              setAddressLine2(def.addressLine2 || "");
              setCity(def.city);
              setState(def.state);
              setPostalCode(def.postalCode);
              setPhone(def.phone);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Shipping calculation
  const freeThreshold = 3500;
  let shippingTotal = 0;
  if (subtotal < freeThreshold) {
    shippingTotal = shippingMethod === "EXPRESS" ? 300 : 150;
  } else if (shippingMethod === "EXPRESS") {
    shippingTotal = 150; // Discounted express
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingTotal);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Please add products before checking out.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        email,
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        shippingMethod,
        paymentMethod,
        promoCode: discount?.code,
        orderNotes,
        items: items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSubmitting(false);
        setErrorMessage(data.message || "Failed to place order. Please review your details.");
        return;
      }

      // Order created successfully in DB with inventory decremented
      const payment = data.payment;

      // Handle eSewa form post
      if (paymentMethod === "ESEWA" && payment.formActionUrl && payment.formData) {
        clearCart();
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payment.formActionUrl;

        for (const [key, val] of Object.entries(payment.formData)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val as string;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Handle Khalti or other redirects
      if (payment.redirectUrl) {
        clearCart();
        window.location.href = payment.redirectUrl;
        return;
      }

      // Direct fallback
      clearCart();
      router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
    } catch (err: unknown) {
      console.error("Checkout submission error:", err);
      setIsSubmitting(false);
      setErrorMessage("Network error processing your order. Please check your connection.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#141716] mb-3">Your cart is currently empty</h1>
        <p className="text-xs text-[#5c6b64] mb-6">Add products to your cart to begin checkout.</p>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d]"
        >
          Browse Supplements
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Header */}
      <div className="mb-8 flex items-center justify-between border-b border-[#e6dfd3] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#141716]">Secure Checkout</h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Complete your order with verified payment and nationwide delivery.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-[#1b3b2c] font-semibold bg-[#e8f0eb] px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Order Verification Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Fields */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact Information */}
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f3eee3] pb-3">
                <h2 className="font-serif text-lg font-bold text-[#141716]">
                  1. Contact Information
                </h2>
                {!user && (
                  <Link href="/login" className="text-xs text-[#1b3b2c] font-semibold hover:underline">
                    Already have an account? Sign in
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#141716] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Siddhartha Thapa"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#141716] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. siddhartha@example.com"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#141716] mb-1">
                    Mobile Phone Number (For Courier Contact) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +977 9841234567"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
                2. Domestic Delivery Address (Nepal)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#141716] mb-1">
                    Street Address / House / Ward *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. House 42, Shanti Marga, Baluwatar"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#141716] mb-1">
                    Apartment / Suite / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near Russian Embassy"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#141716] mb-1">City / Municipality *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kathmandu"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#141716] mb-1">Province / State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  >
                    <option value="Bagmati Province">Bagmati Province (Kathmandu Valley)</option>
                    <option value="Gandaki Province">Gandaki Province (Pokhara)</option>
                    <option value="Koshi Province">Koshi Province (Biratnagar / Dharan)</option>
                    <option value="Madhesh Province">Madhesh Province (Janakpur / Birgunj)</option>
                    <option value="Lumbini Province">Lumbini Province (Butwal / Bhairahawa)</option>
                    <option value="Karnali Province">Karnali Province (Surkhet)</option>
                    <option value="Sudurpashchim Province">Sudurpashchim Province (Dhangadhi)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#141716] mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 44600"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#141716] mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full px-3 py-2 bg-gray-100 border border-[#e6dfd3] rounded-lg text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Shipping Options */}
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
                3. Delivery Method
              </h2>

              <div className="space-y-3 text-xs">
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === "STANDARD"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="STANDARD"
                      checked={shippingMethod === "STANDARD"}
                      onChange={() => setShippingMethod("STANDARD")}
                      className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#141716]">Standard Domestic Delivery</p>
                      <p className="text-[#5c6b64]">2 to 3 business days across Nepal</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#1b3b2c]">
                    {subtotal >= freeThreshold ? "FREE" : formatPrice(150)}
                  </span>
                </label>

                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === "EXPRESS"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="EXPRESS"
                      checked={shippingMethod === "EXPRESS"}
                      onChange={() => setShippingMethod("EXPRESS")}
                      className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#141716]">Express Priority Courier</p>
                      <p className="text-[#5c6b64]">Next business day dispatch for major cities</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#1b3b2c]">
                    {subtotal >= freeThreshold ? formatPrice(150) : formatPrice(300)}
                  </span>
                </label>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
                4. Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* eSewa */}
                <label
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === "ESEWA"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ESEWA"
                        checked={paymentMethod === "ESEWA"}
                        onChange={() => setPaymentMethod("ESEWA")}
                        className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                      />
                      <span className="font-bold text-sm text-[#141716]">eSewa Wallet</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">
                      Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5c6b64] mt-2">
                    Pay securely using Nepal&apos;s leading digital wallet. (EPAY sandbox mode active).
                  </p>
                </label>

                {/* Khalti */}
                <label
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === "KHALTI"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="KHALTI"
                        checked={paymentMethod === "KHALTI"}
                        onChange={() => setPaymentMethod("KHALTI")}
                        className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                      />
                      <span className="font-bold text-sm text-[#141716]">Khalti Gateway</span>
                    </div>
                    <Wallet className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="text-[11px] text-[#5c6b64] mt-2">
                    Pay via Khalti Wallet, ConnectIPS, or Mobile Banking.
                  </p>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                      />
                      <span className="font-bold text-sm text-[#141716]">Cash on Delivery</span>
                    </div>
                    <Truck className="w-4 h-4 text-[#8c571e]" />
                  </div>
                  <p className="text-[11px] text-[#5c6b64] mt-2">
                    Pay cash in hand when the courier delivers your package.
                  </p>
                </label>

                {/* Sandbox / Test Card */}
                <label
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === "TEST_CARD"
                      ? "border-[#1b3b2c] bg-[#f2f7f4] ring-1 ring-[#1b3b2c]"
                      : "border-[#e6dfd3] hover:bg-[#fbf9f5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="TEST_CARD"
                        checked={paymentMethod === "TEST_CARD"}
                        onChange={() => setPaymentMethod("TEST_CARD")}
                        className="text-[#1b3b2c] focus:ring-[#1b3b2c]"
                      />
                      <span className="font-bold text-sm text-[#141716]">Sandbox Card</span>
                    </div>
                    <CreditCard className="w-4 h-4 text-sky-700" />
                  </div>
                  <p className="text-[11px] text-[#5c6b64] mt-2">
                    Test / Demo card simulation mode (No real financial charge).
                  </p>
                </label>
              </div>

              {/* Instructions regarding payment secrets */}
              <div className="p-3 bg-[#f8f5ee] rounded-xl text-[11px] text-[#5c6b64] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#1b3b2c] flex-shrink-0" />
                <span>
                  Payments are authenticated securely via server-side verification. Raw payment card secrets are never stored.
                </span>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs">
              <label className="block font-semibold text-xs text-[#141716] mb-1.5">
                Delivery Instructions / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Ring bell upon arrival or leave with guard"
                className="w-full px-3 py-2 text-xs bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Preview & Submit */}
          <div className="lg:col-span-5 bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
              Order Review ({items.length} items)
            </h2>

            {/* Items list */}
            <div className="divide-y divide-[#f3eee3] max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="py-3 flex space-x-3 text-xs">
                  <div className="relative w-14 h-14 rounded-lg bg-[#fbf9f5] border border-[#e6dfd3] overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#141716] truncate">{item.name}</p>
                    <p className="text-[#5c6b64] text-[11px]">{item.variantName}</p>
                    <p className="text-[#85958d] text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-[#141716]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount summary if applied */}
            {discount && (
              <div className="p-3 bg-[#f2f7f4] border border-[#b5d5c5] rounded-xl text-xs flex justify-between items-center text-[#1b3b2c]">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo: <strong>{discount.code}</strong></span>
                </div>
                <span className="font-bold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-[#5c6b64] border-t border-[#f3eee3] pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#141716]">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({shippingMethod === "EXPRESS" ? "Express" : "Standard"})</span>
                <span>
                  {shippingTotal === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    formatPrice(shippingTotal)
                  )}
                </span>
              </div>

              <div className="border-t border-[#e6dfd3] pt-3 flex justify-between text-base font-bold text-[#141716]">
                <span>Total Amount Due</span>
                <span className="font-serif text-xl text-[#1b3b2c]">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying & Placing Order...</span>
              ) : (
                <>
                  <span>
                    Place Order &bull; {formatPrice(finalTotal)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-[#85958d] text-center leading-normal">
              By placing your order, you agree to Krag Organic&apos;s Terms of Service and Shipping Policies.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
