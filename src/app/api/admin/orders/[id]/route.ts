import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { slug: true, images: { take: 1 } } },
          },
        },
        payments: true,
        shipments: true,
        redemptions: { include: { discount: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load order details";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const { status, paymentStatus, fulfillmentStatus, carrier, trackingNumber, cancellationReason } = body;

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true, shipments: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataToUpdate: any = {};
      if (status) dataToUpdate.status = status;
      if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
      if (fulfillmentStatus) dataToUpdate.fulfillmentStatus = fulfillmentStatus;
      if (cancellationReason) dataToUpdate.cancellationReason = cancellationReason;

      const orderUpdated = await tx.order.update({
        where: { id },
        data: dataToUpdate,
      });

      // Handle shipment tracking if provided
      if (carrier || trackingNumber) {
        const existingShipment = existingOrder.shipments[0];
        if (existingShipment) {
          await tx.shipment.update({
            where: { id: existingShipment.id },
            data: {
              carrier: carrier || existingShipment.carrier,
              trackingNumber: trackingNumber || existingShipment.trackingNumber,
              status: fulfillmentStatus === "FULFILLED" ? "DELIVERED" : "IN_TRANSIT",
              shippedAt: existingShipment.shippedAt || new Date(),
            },
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId: id,
              carrier: carrier || "Sundar Express",
              trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
              status: fulfillmentStatus === "FULFILLED" ? "DELIVERED" : "IN_TRANSIT",
              shippedAt: new Date(),
            },
          });
        }
      }

      // If status changed to CANCELLED, restock items back into inventory
      if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
        for (const item of existingOrder.items) {
          if (item.productVariantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.productVariantId },
            });
            if (variant) {
              const newStock = variant.stock + item.quantity;
              await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: newStock },
              });
              await tx.inventoryLog.create({
                data: {
                  productVariantId: item.productVariantId,
                  changeQuantity: item.quantity,
                  previousStock: variant.stock,
                  newStock,
                  reason: "RETURN",
                  notes: `Restocked due to Order ${existingOrder.orderNumber} cancellation`,
                  createdByAdminId: admin.id,
                },
              });
            }
          }
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "UPDATE_ORDER_STATUS",
          entityType: "ORDER",
          entityId: id,
          details: JSON.stringify({
            orderNumber: existingOrder.orderNumber,
            fromStatus: existingOrder.status,
            toStatus: status || existingOrder.status,
            paymentStatus: paymentStatus || existingOrder.paymentStatus,
            fulfillmentStatus: fulfillmentStatus || existingOrder.fulfillmentStatus,
          }),
        },
      });

      return orderUpdated;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    console.error("Order status update error:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
