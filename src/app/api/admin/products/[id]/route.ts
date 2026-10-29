import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load product";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid product information" },
        { status: 400 }
      );
    }

    const { images, variants, ...prodData } = parsed.data;

    const updated = await db.$transaction(async (tx) => {
      // 1. Update basic product details
      const prod = await tx.product.update({
        where: { id },
        data: prodData,
      });

      // 2. Refresh images
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: images.map((url, idx) => ({
          productId: id,
          url,
          altText: `${prodData.name} image ${idx + 1}`,
          isPrimary: idx === 0,
          displayOrder: idx,
        })),
      });

      // 3. Upsert or update variants
      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              flavor: v.flavor,
              weight: v.weight,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              flavor: v.flavor,
              weight: v.weight,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock,
            },
          });
        }
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "UPDATE_PRODUCT",
          entityType: "PRODUCT",
          entityId: id,
          details: JSON.stringify({ name: prod.name, updatedFields: Object.keys(prodData) }),
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    console.error("Update product error:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to update product";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await props.params;

    // Toggle active status (archive product) rather than hard-deleting to preserve historical orders
    const archived = await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    await db.auditLog.create({
      data: {
        adminId: admin.id,
        action: "ARCHIVE_PRODUCT",
        entityType: "PRODUCT",
        entityId: id,
        details: JSON.stringify({ name: archived.name }),
      },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to archive product";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
