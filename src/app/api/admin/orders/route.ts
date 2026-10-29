import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const fulfillmentStatus = searchParams.get("fulfillmentStatus");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus && fulfillmentStatus !== "ALL") {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    if (query) {
      where.OR = [
        { orderNumber: { contains: query } },
        { guestName: { contains: query } },
        { guestEmail: { contains: query } },
        { shippingFullName: { contains: query } },
        { shippingPhone: { contains: query } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payments: true,
        shipments: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch orders";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
