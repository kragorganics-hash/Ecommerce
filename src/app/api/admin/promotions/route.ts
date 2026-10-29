import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { discountSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();

    const discounts = await db.discount.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return NextResponse.json({ success: true, discounts });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load discounts";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = discountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid discount data" },
        { status: 400 }
      );
    }

    const { code, description, discountType, value, minimumOrderAmount, maxUses, isActive, startDate, endDate } =
      parsed.data;

    // Check code uniqueness
    const existing = await db.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Promo code "${code}" already exists.` },
        { status: 400 }
      );
    }

    const discount = await db.discount.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        value,
        minimumOrderAmount,
        maxUses: maxUses || null,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await db.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_DISCOUNT",
        entityType: "DISCOUNT",
        entityId: discount.id,
        details: JSON.stringify({ code: discount.code, discountType, value }),
      },
    });

    return NextResponse.json({ success: true, discount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create discount";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { id } = await req.json();

    const discount = await db.discount.delete({
      where: { id },
    });

    await db.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_DISCOUNT",
        entityType: "DISCOUNT",
        entityId: id,
        details: JSON.stringify({ code: discount.code }),
      },
    });

    return NextResponse.json({ success: true, message: "Discount deleted successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete discount";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
