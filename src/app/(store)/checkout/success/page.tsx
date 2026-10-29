import React from "react";
import Link from "next/link";
import { CheckCircle2, Truck, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;
  const orderNumber = typeof searchParams.orderNumber === "string" ? searchParams.orderNumber : null;
  const method = typeof searchParams.method === "string" ? searchParams.method : null;

  const order = orderNumber
    ? await db.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
          payments: true,
          shipments: true,
        },
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-3xl p-8 sm:p-12 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#e8f0eb] text-[#1b3b2c] flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716] mt-1 mb-3">
          Thank You For Your Order!
        </h1>
        <p className="text-sm text-[#5c6b64] max-w-md mx-auto leading-relaxed">
          We&apos;ve received your order and our laboratory packaging team will begin preparing your pure botanical supplements.
        </p>

        {order ? (
          <div className="mt-8 text-left bg-[#fbf9f5] border border-[#e6dfd3] rounded-2xl p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6dfd3] pb-4">
              <div>
                <span className="text-xs text-[#5c6b64]">Order Reference</span>
                <p className="font-serif text-lg font-bold text-[#1b3b2c]">
                  {order.orderNumber}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-[#e8f0eb] text-[#1b3b2c] text-xs font-bold rounded-full">
                  Status: {order.status}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#141716] uppercase tracking-wider">
                Items Purchased ({order.items.length})
              </span>
              <div className="divide-y divide-[#f3eee3] text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#141716]">{item.productName}</p>
                      <p className="text-[#5c6b64]">{item.variantName} &times; {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#141716]">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#e6dfd3] text-xs">
              <div>
                <div className="flex items-center space-x-1.5 text-[#141716] font-bold mb-1">
                  <Truck className="w-3.5 h-3.5 text-[#1b3b2c]" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-[#5c6b64] leading-relaxed">
                  {order.shippingFullName} <br />
                  {order.shippingAddress1} {order.shippingAddress2 && `, ${order.shippingAddress2}`} <br />
                  {order.shippingCity}, {order.shippingState} {order.shippingPostalCode} <br />
                  Phone: {order.shippingPhone}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-[#141716] font-bold mb-1">
                  <Package className="w-3.5 h-3.5 text-[#1b3b2c]" />
                  <span>Payment & Financials</span>
                </div>
                <div className="space-y-1 text-[#5c6b64]">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <strong className="text-[#141716]">{order.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-{formatPrice(order.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{order.shippingTotal === 0 ? "FREE" : formatPrice(order.shippingTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#1b3b2c] pt-1 border-t border-[#e6dfd3]">
                    <span>Total Paid/Due:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-[#fbf9f5] rounded-xl text-xs text-[#5c6b64]">
            {method === "cod"
              ? "Your Cash on Delivery order is registered. Please have cash ready upon package delivery."
              : "Your order details have been securely recorded in the system."}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-6 py-3 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <span>View Order History</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 bg-[#f3eee3] hover:bg-[#e6dfd3] text-[#1b3b2c] font-semibold text-xs rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f3eee3] flex items-center justify-center space-x-2 text-[11px] text-[#85958d]">
          <ShieldCheck className="w-4 h-4 text-[#1b3b2c]" />
          <span>Confirmation email and dispatch SMS updates are queued for processing.</span>
        </div>
      </div>
    </div>
  );
}
