import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const orders = await db.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { guestEmail: user.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payments: true,
        shipments: true,
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 401 });
  }
}
