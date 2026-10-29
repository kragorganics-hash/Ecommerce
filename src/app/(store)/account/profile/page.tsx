"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { User, MapPin, Plus, Check, AlertCircle } from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
}

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New address form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [state, setState] = useState("Bagmati Province");
  const [postalCode, setPostalCode] = useState("44600");
  const [phone, setPhone] = useState("");
  const [isDefaultShipping, setIsDefaultShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setAddresses(data.profile.addresses || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ADD_ADDRESS",
          address: {
            fullName,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country: "Nepal",
            phone,
            isDefaultShipping,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => [data.address, ...prev]);
        setShowAddModal(false);
        setFullName("");
        setAddressLine1("");
        setAddressLine2("");
        setPhone("");
        setMessage({ text: "Delivery address added successfully!", isError: false });
      } else {
        setMessage({ text: data.message || "Failed to save address.", isError: true });
      }
    } catch {
      setMessage({ text: "Error saving address.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#e6dfd3]">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
            Account Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
            Profile & Address Book
          </h1>
        </div>
        <Link
          href="/account/orders"
          className="text-xs font-semibold text-[#1b3b2c] hover:underline"
        >
          &larr; Back to Order History
        </Link>
      </div>

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

      {/* Profile Overview Card */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#141716] flex items-center space-x-2">
          <User className="w-5 h-5 text-[#1b3b2c]" />
          <span>Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5c6b64]">
          <div>
            <span className="block font-semibold text-[#141716]">Full Name:</span>
            <span>{user?.name}</span>
          </div>
          <div>
            <span className="block font-semibold text-[#141716]">Email Address:</span>
            <span>{user?.email}</span>
          </div>
          <div>
            <span className="block font-semibold text-[#141716]">Account Role:</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#e8f0eb] text-[#1b3b2c] font-bold rounded">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Address Book */}
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#f3eee3] pb-4">
          <h2 className="font-serif text-lg font-bold text-[#141716] flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#1b3b2c]" />
            <span>Saved Domestic Addresses</span>
          </h2>

          <button
            type="button"
            onClick={() => setShowAddModal(!showAddModal)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Add Address Form Modal / Accordion */}
        {showAddModal && (
          <form
            onSubmit={handleAddAddress}
            className="p-5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl space-y-4 text-xs"
          >
            <h3 className="font-bold text-[#141716]">New Delivery Address</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#141716] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 9841234567"
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#141716] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street / House Number"
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kathmandu"
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">Province</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                >
                  <option value="Bagmati Province">Bagmati Province</option>
                  <option value="Gandaki Province">Gandaki Province</option>
                  <option value="Koshi Province">Koshi Province</option>
                  <option value="Madhesh Province">Madhesh Province</option>
                  <option value="Lumbini Province">Lumbini Province</option>
                  <option value="Karnali Province">Karnali Province</option>
                  <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="44600"
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefaultShipping}
                  onChange={(e) => setIsDefaultShipping(e.target.checked)}
                  className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
                />
                <label htmlFor="defaultCheck" className="font-semibold text-[#141716]">
                  Set as default shipping address
                </label>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 bg-white border border-[#e6dfd3] font-semibold text-[#5c6b64] rounded-lg hover:bg-[#f3eee3]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Existing Addresses List */}
        {isLoading ? (
          <p className="text-xs text-[#5c6b64]">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-xs text-[#5c6b64] py-4">No saved addresses on file.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  addr.isDefaultShipping
                    ? "border-[#1b3b2c] bg-[#f2f7f4]"
                    : "border-[#e6dfd3] bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#141716]">{addr.fullName}</span>
                  {addr.isDefaultShipping && (
                    <span className="px-2 py-0.5 bg-[#1b3b2c] text-white text-[10px] font-bold rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[#5c6b64]">
                  {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-[#5c6b64]">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-[#5c6b64]">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
