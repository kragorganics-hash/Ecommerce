"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Check, AlertCircle, ShieldCheck, Lock } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();

  const [storeName, setStoreName] = useState(initialSettings["store_name"] || "Krag Organic");
  const [storeTagline, setStoreTagline] = useState(initialSettings["store_tagline"] || "Pure botanical sports nutrition & clean supplements");
  const [storeEmail, setStoreEmail] = useState(initialSettings["store_email"] || "care@kragorganic.com");
  const [storePhone, setStorePhone] = useState(initialSettings["store_phone"] || "+977-1-4567890");
  const [storeAddress, setStoreAddress] = useState(initialSettings["store_address"] || "Kathmandu Valley, Nepal");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialSettings["free_shipping_threshold"] || "3500");
  const [standardShippingFee, setStandardShippingFee] = useState(initialSettings["standard_shipping_fee"] || "150");
  const [expressShippingFee, setExpressShippingFee] = useState(initialSettings["express_shipping_fee"] || "300");
  const [announcementBar, setAnnouncementBar] = useState(initialSettings["announcement_bar"] || "Sample Store Preview: Free Delivery across Nepal on orders over Rs. 3,500");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        store_name: storeName,
        store_tagline: storeTagline,
        store_email: storeEmail,
        store_phone: storePhone,
        store_address: storeAddress,
        free_shipping_threshold: freeShippingThreshold,
        standard_shipping_fee: standardShippingFee,
        express_shipping_fee: expressShippingFee,
        announcement_bar: announcementBar,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: "Store configuration saved successfully!", isError: false });
        router.refresh();
      } else {
        setMessage({ text: data.message || "Failed to save settings.", isError: true });
      }
    } catch {
      setMessage({ text: "Error saving settings.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-xs">
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

      {/* Brand Identity & Contact */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
          1. Brand Identity & Customer Service
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#141716] mb-1">Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">Customer Care Email</label>
            <input
              type="email"
              required
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">Support Phone Hotline</label>
            <input
              type="text"
              required
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">Physical Office Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#141716] mb-1">Store Slogan / Tagline</label>
            <input
              type="text"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Shipping & Delivery Configuration */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
          2. Domestic Shipping & Delivery Rules (Nepal)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-[#141716] mb-1">
              Free Delivery Order Threshold (NPR)
            </label>
            <input
              type="number"
              required
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-bold text-[#1b3b2c]"
            />
            <span className="text-[10px] text-[#85958d] mt-1 block">
              Cart subtotals above this amount receive free domestic shipping.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">
              Standard Domestic Delivery Fee (NPR)
            </label>
            <input
              type="number"
              required
              value={standardShippingFee}
              onChange={(e) => setStandardShippingFee(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">
              Express Priority Courier Fee (NPR)
            </label>
            <input
              type="number"
              required
              value={expressShippingFee}
              onChange={(e) => setExpressShippingFee(e.target.value)}
              className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Storefront Banners & Notices */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
          3. Top Announcement Header Bar
        </h2>

        <div>
          <label className="block font-semibold text-[#141716] mb-1">Announcement Marquee Text</label>
          <input
            type="text"
            value={announcementBar}
            onChange={(e) => setAnnouncementBar(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
          />
        </div>
      </div>

      {/* Permanent Developer & Platform Attribution (Locked & Non-Editable) */}
      <div className="bg-[#fbf9f5] border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6dfd3] pb-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#1b3b2c]" />
            <h2 className="font-serif text-base font-bold text-[#141716]">
              4. System Architecture & Platform Developer
            </h2>
          </div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e8f0eb] text-[#1b3b2c] border border-[#c2dbce]">
            <ShieldCheck className="w-3 h-3 text-[#1b3b2c]" />
            <span>Immutable Core System Component</span>
          </span>
        </div>

        <p className="text-xs text-[#5c6b64] leading-relaxed">
          This eCommerce platform, authentication system, database models, and domestic payment integrations (eSewa &amp; Khalti) were built by <strong>Kushal Adhikari</strong>. This attribution is hardcoded into the codebase and cannot be edited, overridden, or removed from this administration portal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 bg-white border border-[#e6dfd3] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#85958d] block tracking-wider">
                Platform Developer
              </span>
              <span className="text-xs font-bold text-[#141716] mt-0.5 block">
                Kushal Adhikari
              </span>
            </div>
            <span className="text-[10px] text-[#85958d] font-mono bg-[#f4f1ea] px-2 py-0.5 rounded border border-[#e6dfd3]">
              Read-Only
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#e6dfd3] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#85958d] block tracking-wider">
                Direct Contact
              </span>
              <a
                href="mailto:kushaladhikari007@gmail.com"
                className="text-xs font-bold text-[#1b3b2c] hover:underline mt-0.5 block"
              >
                kushaladhikari007@gmail.com
              </a>
            </div>
            <span className="text-[10px] text-[#85958d] font-mono bg-[#f4f1ea] px-2 py-0.5 rounded border border-[#e6dfd3]">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-[#1b3b2c] text-white font-bold rounded-xl hover:bg-[#25513d] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving Configuration..." : "Save Store Settings"}
        </button>
      </div>
    </form>
  );
}
