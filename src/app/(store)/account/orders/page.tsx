import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Truck, ShoppingBag, ArrowRight } from "lucide-react";


export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/orders");
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
      shipments: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#e6dfd3] mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
            Customer Account
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
            My Order History
          </h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Welcome, <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/account/profile"
            className="px-4 py-2 bg-white border border-[#e6dfd3] rounded-lg font-semibold text-[#141716] hover:bg-[#fbf9f5]"
          >
            Manage Addresses
          </Link>
          <Link
            href="/products"
            className="px-4 py-2 bg-[#1b3b2c] text-white rounded-lg font-semibold hover:bg-[#25513d]"
          >
            Shop Supplements
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#f3eee3] text-[#5c6b64] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#141716] mb-2">
            No Orders Yet
          </h2>
          <p className="text-xs text-[#5c6b64] mb-6">
            You haven&apos;t placed any orders with this account yet. Start exploring our clean nutritional supplements.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#1b3b2c] text-white text-xs font-semibold rounded-lg hover:bg-[#25513d]"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipment = order.shipments[0];

            return (
              <div
                key={order.id}
                className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Header row */}
                <div className="p-5 bg-[#fbf9f5] border-b border-[#e6dfd3] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-[#85958d] block text-[10px] uppercase font-semibold">
                        Order Number
                      </span>
                      <span className="font-serif font-bold text-[#1b3b2c] text-sm">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#85958d] block text-[10px] uppercase font-semibold">
                        Date Placed
                      </span>
                      <span className="font-medium text-[#141716]">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#85958d] block text-[10px] uppercase font-semibold">
                        Total Amount
                      </span>
                      <span className="font-bold text-[#141716]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>

                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Items and shipping body */}
                <div className="p-5 sm:p-6 divide-y divide-[#f3eee3]">
                  <div className="pb-4 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#141716] flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-[#1b3b2c]" />
                      <span>Items in this Order ({order.items.length})</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-1">
                          <div>
                            <span className="font-semibold text-[#141716]">{item.productName}</span>
                            <span className="text-[#5c6b64] ml-2">({item.variantName})</span>
                            <span className="text-[#85958d] ml-2">&times; {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-[#141716]">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Tracking */}
                  <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                    <div className="flex items-start space-x-2 text-[#5c6b64]">
                      <Truck className="w-4 h-4 text-[#1b3b2c] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#141716]">Delivery To: </span>
                        <span>
                          {order.shippingFullName}, {order.shippingCity}, {order.shippingState}
                        </span>
                      </div>
                    </div>

                    {shipment ? (
                      <div className="bg-[#f2f7f4] px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#1b3b2c]">
                        Carrier: {shipment.carrier || "Sundar Express"} | Tracking:{" "}
                        <strong className="font-bold">{shipment.trackingNumber || "Pending"}</strong>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#85958d]">
                        Fulfillment: {order.fulfillmentStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
