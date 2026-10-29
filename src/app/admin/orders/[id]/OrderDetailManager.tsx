"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Truck,
  Package,
  User,
  CreditCard,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";

interface OrderDetailManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
}

export function OrderDetailManager({ order: initialOrder }: OrderDetailManagerProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);

  // Form states
  const [status, setStatus] = useState(initialOrder.status);
  const [paymentStatus, setPaymentStatus] = useState(initialOrder.paymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initialOrder.fulfillmentStatus);
  const [carrier, setCarrier] = useState(initialOrder.shipments[0]?.carrier || "Sundar Express");
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.shipments[0]?.trackingNumber || "");
  const [cancellationReason, setCancellationReason] = useState(initialOrder.cancellationReason || "");

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          fulfillmentStatus,
          carrier,
          trackingNumber,
          cancellationReason: status === "CANCELLED" ? cancellationReason : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        setMessage({ text: "Order details updated successfully!", isError: false });
        router.refresh();
      } else {
        setMessage({ text: data.message || "Failed to update order.", isError: true });
      }
    } catch {
      setMessage({ text: "Error updating order.", isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3]">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border border-[#e6dfd3] rounded-lg hover:bg-[#fbf9f5] text-[#5c6b64]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-2xl font-bold text-[#141716]">
                Order {order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 bg-[#e8f0eb] text-[#1b3b2c] font-bold text-xs rounded-full">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[#5c6b64]">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info & Line Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Line Items */}
          <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#141716] flex items-center space-x-2 border-b border-[#f3eee3] pb-3">
              <Package className="w-4 h-4 text-[#1b3b2c]" />
              <span>Purchased Line Items ({order.items.length})</span>
            </h2>

            <div className="divide-y divide-[#f3eee3] text-xs">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-[#141716]">{item.productName}</p>
                    <p className="text-[#5c6b64]">
                      {item.variantName} &bull; SKU: <span className="font-mono">{item.sku}</span>
                    </p>
                    <p className="text-[#85958d]">
                      {formatPrice(item.price)} &times; {item.quantity}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#141716]">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#e6dfd3] space-y-1.5 text-xs text-[#5c6b64]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#141716]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Total</span>
                <span>{order.shippingTotal === 0 ? "FREE" : formatPrice(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1b3b2c] pt-2 border-t border-[#f3eee3]">
                <span>Grand Total</span>
                <span className="font-serif text-base">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-2 text-xs">
              <h3 className="font-serif text-sm font-bold text-[#141716] flex items-center space-x-1.5 border-b border-[#f3eee3] pb-2">
                <User className="w-4 h-4 text-[#1b3b2c]" />
                <span>Customer Contact</span>
              </h3>
              <p className="font-semibold text-[#141716]">{order.shippingFullName}</p>
              <p className="text-[#5c6b64]">{order.guestEmail}</p>
              <p className="text-[#5c6b64]">{order.shippingPhone}</p>
              {order.userId ? (
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#e8f0eb] text-[#1b3b2c] font-semibold text-[10px] rounded">
                  Registered Account Member
                </span>
              ) : (
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold text-[10px] rounded">
                  Guest Checkout
                </span>
              )}
            </div>

            <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-2 text-xs">
              <h3 className="font-serif text-sm font-bold text-[#141716] flex items-center space-x-1.5 border-b border-[#f3eee3] pb-2">
                <Truck className="w-4 h-4 text-[#1b3b2c]" />
                <span>Destination Address</span>
              </h3>
              <p className="text-[#2b322f] leading-relaxed">
                {order.shippingAddress1} {order.shippingAddress2 && `, ${order.shippingAddress2}`} <br />
                {order.shippingCity}, {order.shippingState} {order.shippingPostalCode} <br />
                {order.shippingCountry}
              </p>
              {order.notes && (
                <div className="mt-3 p-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded text-[11px] text-[#5c6b64]">
                  <strong>Delivery Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Status Management Form */}
        <div className="lg:col-span-4 bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-3">
            Status & Tracking Operations
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#141716] mb-1">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-semibold text-[#141716]"
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED (Auto-Restocks Inventory)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-semibold text-[#141716]"
              >
                <option value="PENDING">PENDING (Unpaid / COD Balance)</option>
                <option value="PAID">PAID (Verified by Gateway)</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
              <span className="text-[10px] text-[#85958d] mt-1 block">
                Method: <strong>{order.paymentMethod}</strong>
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Fulfillment Status</label>
              <select
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-semibold text-[#141716]"
              >
                <option value="UNFULFILLED">UNFULFILLED</option>
                <option value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</option>
                <option value="FULFILLED">FULFILLED</option>
              </select>
            </div>

            <div className="border-t border-[#f3eee3] pt-3">
              <label className="block font-semibold text-[#141716] mb-1">Logistics Courier</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Sundar Express, Aramex, Nepal Post"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Tracking Number / Airway Bill</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. SNDR-KTM-4410"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg font-mono text-xs"
              />
            </div>

            {status === "CANCELLED" && (
              <div>
                <label className="block font-semibold text-rose-700 mb-1">Cancellation Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Customer request or damaged batch recall"
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 bg-[#1b3b2c] text-white font-bold rounded-xl hover:bg-[#25513d] transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Saving Status..." : "Save Order Status"}
            </button>
          </form>

          <div className="p-3 bg-[#fbf9f5] rounded-xl text-[11px] text-[#5c6b64] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#1b3b2c] flex-shrink-0" />
            <span>Every status alteration creates an immutable audit trail entry.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
