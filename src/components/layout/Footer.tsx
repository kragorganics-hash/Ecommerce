"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Thank you for subscribing to Krag Organic updates.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Please check connection.");
    }
  };

  return (
    <footer className="bg-[#12281e] text-[#f2f7f4] pt-16 pb-12 border-t border-[#1b3b2c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#1f4533]">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-[#31684f] text-[#fbf9f5] flex items-center justify-center font-bold text-base">
                KO
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                KRAG <span className="text-[#dcb36d] text-lg font-sans font-medium uppercase tracking-[0.2em] ml-1">ORGANIC</span>
              </span>
            </div>
            <p className="text-sm text-[#b5d5c5] leading-relaxed max-w-md">
              Pioneering clean sports nutrition and fitness supplements crafted with pristine botanicals, grass-fed proteins, and third-party verified purity. Zero synthetic dyes, zero fillers, zero compromises.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#dcb36d] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#dcb36d]" />
              <span>Independent Laboratory Verified Formulations (Sample Verification Notice)</span>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <h3 className="text-base font-semibold text-white mb-2">
              Join the Krag Wellness Circle
            </h3>
            <p className="text-xs text-[#b5d5c5] mb-4">
              Receive evidence-informed training nutrition guides, new small-batch releases, and exclusive member discounts.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c6b64]" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading" || status === "success"}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#163626] border border-[#25513d] text-white placeholder-[#85958d] rounded-lg focus:outline-none focus:border-[#dcb36d]"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="px-6 py-2.5 bg-[#dcb36d] text-[#12281e] font-semibold text-sm rounded-lg hover:bg-[#e8c688] transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {status === "loading" ? (
                  <span>Subscribing...</span>
                ) : status === "success" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {message && (
              <p
                className={`text-xs mt-2 ${
                  status === "success" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#1f4533] text-sm">
          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Supplements
            </h4>
            <ul className="space-y-2.5 text-[#b5d5c5]">
              <li>
                <Link href="/products?category=protein-powder" className="hover:text-white transition-colors">
                  Grass-Fed Whey & Plant
                </Link>
              </li>
              <li>
                <Link href="/products?category=creatine" className="hover:text-white transition-colors">
                  Micronized Creatine
                </Link>
              </li>
              <li>
                <Link href="/products?category=pre-workout" className="hover:text-white transition-colors">
                  Natural Pre-Workouts
                </Link>
              </li>
              <li>
                <Link href="/products?category=recovery" className="hover:text-white transition-colors">
                  Electrolytes & BCAAs
                </Link>
              </li>
              <li>
                <Link href="/products?category=wellness" className="hover:text-white transition-colors">
                  Himalayan Shilajit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-[#b5d5c5]">
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Returns & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="text-[#85958d]">Hotline: +977-1-4567890</span>
              </li>
              <li>
                <span className="text-[#85958d]">care@kragorganic.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Brand & Quality
            </h4>
            <ul className="space-y-2.5 text-[#b5d5c5]">
              <li>
                <Link href="/#our-standards" className="hover:text-white transition-colors">
                  Sourcing & Quality Pillars
                </Link>
              </li>
              <li>
                <Link href="/#story" className="hover:text-white transition-colors">
                  Our Mission & Story
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#85958d]">Bagmati Province, Nepal</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Accepted Payments
            </h4>
            <div className="space-y-2 text-xs text-[#b5d5c5]">
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-[#1a3d2c] border border-[#275940] rounded text-emerald-300 font-semibold text-[11px]">
                  eSewa Digital Wallet
                </span>
                <span className="px-2.5 py-1 bg-[#1a3d2c] border border-[#275940] rounded text-purple-300 font-semibold text-[11px]">
                  Khalti Gateway
                </span>
                <span className="px-2.5 py-1 bg-[#1a3d2c] border border-[#275940] rounded text-amber-300 font-semibold text-[11px]">
                  Cash on Delivery (COD)
                </span>
                <span className="px-2.5 py-1 bg-[#1a3d2c] border border-[#275940] rounded text-sky-300 font-semibold text-[11px]">
                  Sandbox Card Mode
                </span>
              </div>
              <p className="text-[11px] text-[#85958d] pt-2">
                All transactions are processed through encrypted, server-verified integrations. No raw card data is ever collected or stored.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#85958d] gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>
              &copy; {new Date().getFullYear()} Krag Organic Technologies Ltd. All rights reserved.
            </p>
            <p className="text-[11px] text-[#718279]">
              Disclaimer: Sample Store demonstration. Placeholder nutritional information is marked for commercial verification before official retail launch. These products are not intended to diagnose, treat, cure, or prevent any medical disease.
            </p>
          </div>

          <div className="flex space-x-6 text-xs text-[#b5d5c5]">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
