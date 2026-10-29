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

  const orderId = searchParams.get("orderId");
  const encodedData = searchParams.get("data"); // eSewa v2
  const pidx = searchParams.get("pidx"); // Khalti
  const transactionId = searchParams.get("transactionId");
  const paymentFlag = searchParams.get("payment");

  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout?error=missing_order", req.url));
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
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
