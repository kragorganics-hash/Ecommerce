import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";

export async function GET(req: NextRequest) {
  return handlePaymentVerification(req);
}

export async function POST(req: NextRequest) {
  return handlePaymentVerification(req);
}

async function handlePaymentVerification(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  let rawOrderId = searchParams.get("orderId");
  let encodedData = searchParams.get("data"); // eSewa v2
  const pidx = searchParams.get("pidx"); // Khalti
  const transactionId = searchParams.get("transactionId");
  const paymentFlag = searchParams.get("payment");

  // Handle URL double question marks if eSewa blindly appended ?data=
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

  // Parse eSewa data if available
  let decodedEsewa: Record<string, unknown> | null = null;
  if (encodedData) {
    try {
      const decodedStr = Buffer.from(encodedData, "base64").toString("utf-8");
      decodedEsewa = JSON.parse(decodedStr);
    } catch (e) {
      console.error("Failed to decode eSewa response data:", e);
    }
  }

  try {
    // Robust Order Resolution:
    // 1. From eSewa's transaction_uuid (format: KRAG-2026-XXXXXX-timestamp)
    // 2. From orderId / cleanOrderId
    // 3. From transactionId
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
            { id: extractedOrderNumber },
          ],
        },
        include: { payments: true },
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
        include: { payments: true },
      });
    }

    if (!order && transactionId) {
      order = await db.order.findFirst({
        where: {
          OR: [
            { id: transactionId },
            { orderNumber: transactionId },
          ],
        },
        include: { payments: true },
      });
    }

    if (!order) {
      console.error("Payment verification order not found. Request URL:", req.url);
      return NextResponse.redirect(new URL("/checkout?error=order_not_found", req.url));
    }

    // Idempotency check: If order is already paid, redirect straight to confirmation page
    if (order.paymentStatus === "PAID") {
      return NextResponse.redirect(
        new URL(`/checkout/success?orderNumber=${order.orderNumber}`, req.url)
      );
    }

    // For Cash on Delivery
    if (order.paymentMethod === "COD" || paymentFlag === "cod") {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "PENDING",
        },
      });

      return NextResponse.redirect(
        new URL(`/checkout/success?orderNumber=${order.orderNumber}&method=cod`, req.url)
      );
    }

    // Call payment provider verification
    const provider = getPaymentProvider(order.paymentMethod);
    const verifyResult = await provider.verifyPayment({
      orderId: order.id,
      transactionId: transactionId || undefined,
      encodedData: encodedData || undefined,
      pidx: pidx || undefined,
    });

    if (verifyResult.success && verifyResult.status === "PAID") {
      // Atomic update of Order and Payment status
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
        });

        const existingPayment = order.payments[0];
        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: "SUCCESS",
              transactionId: verifyResult.transactionId,
              amount: order.total,
              providerData: JSON.stringify(verifyResult.providerRaw),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              paymentMethod: order.paymentMethod,
              transactionId: verifyResult.transactionId,
              amount: order.total,
              status: "SUCCESS",
              providerData: JSON.stringify(verifyResult.providerRaw),
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "PAYMENT_VERIFIED",
            entityType: "ORDER",
            entityId: order.id,
            details: JSON.stringify({
              paymentMethod: order.paymentMethod,
              transactionId: verifyResult.transactionId,
              amount: order.total,
            }),
          },
        });
      });

      return NextResponse.redirect(
        new URL(`/checkout/success?orderNumber=${order.orderNumber}`, req.url)
      );
    } else {
      // Payment failed
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });

      return NextResponse.redirect(
        new URL(`/checkout?error=payment_declined&orderNumber=${order.orderNumber}`, req.url)
      );
    }
  } catch (err: unknown) {
    console.error("Payment verification route error:", err);
    return NextResponse.redirect(new URL("/checkout?error=verification_exception", req.url));
  }
}
