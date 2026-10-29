import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      lowStockVariants,
      recentOrders,
      recentAuditLogs,
    ] = await Promise.all([
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.product.count({ where: { isActive: true } }),
      db.order.findMany({
        where: { paymentStatus: { in: ["PAID", "SUCCESS"] } },
        select: { total: true },
      }),
      db.productVariant.findMany({
        where: { stock: { lte: 10 }, isActive: true },
        include: { product: { select: { name: true, slug: true } } },
        take: 10,
      }),
      db.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { items: true, payments: true },
      }),
      db.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true, email: true } } },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockVariants.length,
      },
      lowStockVariants,
      recentOrders,
      recentAuditLogs,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unauthorized or failed to load overview";
    const status = errorMsg.includes("Unauthorized") ? 401 : errorMsg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, message: errorMsg }, { status });
  }
}
