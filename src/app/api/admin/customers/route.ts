import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { role: "CUSTOMER" };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const customers = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Compute metrics per customer
    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === "PAID")
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        joinedAt: c.createdAt,
        totalOrders: c.orders.length,
        totalSpent,
        recentOrders: c.orders.slice(0, 3),
        addressesCount: c.addresses.length,
      };
    });

    return NextResponse.json({ success: true, customers: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load customers";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
