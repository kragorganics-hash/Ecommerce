import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, orderSubtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, message: "Promo code is required." }, { status: 400 });
    }

    const discount = await db.discount.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return NextResponse.json({ success: false, message: "Invalid or expired promo code." }, { status: 404 });
    }

    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return NextResponse.json({ success: false, message: "This promo code is not active yet." }, { status: 400 });
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      return NextResponse.json({ success: false, message: "This promo code has expired." }, { status: 400 });
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ success: false, message: "This promo code has reached its maximum usage limit." }, { status: 400 });
    }

    const subtotal = Number(orderSubtotal) || 0;
    if (subtotal < discount.minimumOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount of Rs. ${discount.minimumOrderAmount.toLocaleString()} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    let calculatedDiscount = 0;
    if (discount.discountType === "PERCENTAGE") {
      calculatedDiscount = Math.round((subtotal * discount.value) / 100);
    } else {
      calculatedDiscount = Math.min(discount.value, subtotal);
    }

    return NextResponse.json({
      success: true,
      message: `Coupon code '${discount.code}' applied successfully!`,
      discount: {
        code: discount.code,
        discountType: discount.discountType,
        value: discount.value,
        amount: calculatedDiscount,
        description: discount.description,
      },
    });
  } catch (err: unknown) {
    console.error("Discount validation error:", err);
    return NextResponse.json({ success: false, message: "Failed to validate promo code." }, { status: 500 });
  }
}
