import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { stockAdjustmentSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = stockAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid adjustment data" },
        { status: 400 }
      );
    }

    const { variantId, changeQuantity, reason, notes } = parsed.data;

    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ success: false, message: "Variant not found" }, { status: 404 });
    }

    const previousStock = variant.stock;
    const newStock = Math.max(0, previousStock + changeQuantity);

    await db.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      });

      await tx.inventoryLog.create({
        data: {
          productVariantId: variantId,
          changeQuantity,
          previousStock,
          newStock,
          reason,
          notes: notes || `Admin stock adjustment by ${admin.name}`,
          createdByAdminId: admin.id,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "ADJUST_STOCK",
          entityType: "INVENTORY",
          entityId: variantId,
          details: JSON.stringify({
            productName: variant.product.name,
            variantName: variant.name,
            previousStock,
            newStock,
            changeQuantity,
            reason,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Stock level updated successfully",
      newStock,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to adjust stock";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
