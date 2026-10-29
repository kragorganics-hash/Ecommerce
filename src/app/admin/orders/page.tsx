import React from "react";
import { db } from "@/lib/db";
import { OrdersTable } from "./OrdersTable";


export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true, quantity: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Sales Operations
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Customer Orders & Fulfillment ({orders.length})
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Search orders, update fulfillment statuses, track couriers, and manage customer requests.
        </p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
