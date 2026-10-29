import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OrderDetailManager } from "./OrderDetailManager";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage(props: OrderDetailPageProps) {
  const { id } = await props.params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      shipments: true,
      redemptions: { include: { discount: true } },
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderDetailManager order={order} />;
}
