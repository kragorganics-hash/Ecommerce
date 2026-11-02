import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  return handleCancel(req);
}

export async function POST(req: NextRequest) {
  return handleCancel(req);
}

async function handleCancel(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const rawOrderId = searchParams.get("orderId");
  let encodedData = searchParams.get("data");

  if (!encodedData && req.url.includes("data=")) {
    try {
      const match = req.url.match(/[?&]data=([^&]+)/);
      if (match && match[1]) {
        encodedData = decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }

  let decodedEsewa: Record<string, unknown> | null = null;
  if (encodedData) {
    try {
      const decodedStr = Buffer.from(encodedData, "base64").toString("utf-8");
      decodedEsewa = JSON.parse(decodedStr);
    } catch (e) {
      console.error("Could not parse eSewa cancel data:", e);
    }
  }

  try {
    let order = null;

    if (decodedEsewa?.transaction_uuid) {
      const uuid = String(decodedEsewa.transaction_uuid);
      const extractedOrderNumber = uuid.includes("-")
        ? uuid.slice(0, uuid.lastIndexOf("-"))
        : uuid;

      order = await db.order.findFirst({
        where: {
          OR: [
            { orderNumber: extractedOrderNumber },
            { orderNumber: uuid },
            { id: uuid },
          ],
        },
        include: { items: true, payments: true },
      });
    }

    if (!order && rawOrderId) {
      const cleanOrderId = rawOrderId.split("?")[0].split("&")[0];
      order = await db.order.findFirst({
        where: {
          OR: [
            { id: cleanOrderId },
            { orderNumber: cleanOrderId },
          ],
        },
        include: { items: true, payments: true },
      });
    }

    if (order && order.paymentStatus !== "PAID") {
      await db.$transaction(async (tx) => {
        // 1. Mark order as cancelled
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
            cancellationReason: "Payment cancelled by customer at payment gateway",
          },
        });

        // 2. Mark payment attempts as failed
        if (order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: { status: "FAILED" },
          });
        }

        // 3. Restock inventory
        for (const item of order.items) {
          if (item.productVariantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.productVariantId },
            });

            if (variant) {
              const restoredStock = variant.stock + item.quantity;
              await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: restoredStock },
              });

              await tx.inventoryLog.create({
                data: {
                  productVariantId: item.productVariantId,
                  changeQuantity: item.quantity,
                  previousStock: variant.stock,
                  newStock: restoredStock,
                  reason: "RETURN",
                  notes: `Restocked cancelled order ${order.orderNumber}`,
                },
              });
            }
          }
        }
      });
    }
  } catch (err) {
    console.error("Error processing payment cancellation:", err);
  }

  return NextResponse.redirect(new URL("/checkout?error=payment_failed", req.url));
}
