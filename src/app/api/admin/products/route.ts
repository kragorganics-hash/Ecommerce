import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch products";
    const status = errorMsg.includes("Unauthorized") ? 401 : errorMsg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, message: errorMsg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid product information" },
        { status: 400 }
      );
    }

    const { images, variants, ...prodData } = parsed.data;

    // Verify slug uniqueness
    const existing = await db.product.findUnique({
      where: { slug: prodData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A product with this slug already exists." },
        { status: 400 }
      );
    }

    // Atomic creation
    const newProduct = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...prodData,
          images: {
            create: images.map((url, idx) => ({
              url,
              altText: `${prodData.name} image ${idx + 1}`,
              isPrimary: idx === 0,
              displayOrder: idx,
            })),
          },
          variants: {
            create: variants.map((v) => ({
              name: v.name,
              flavor: v.flavor,
              weight: v.weight,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock,
            })),
          },
        },
        include: {
          variants: true,
          images: true,
          category: true,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "CREATE_PRODUCT",
          entityType: "PRODUCT",
          entityId: created.id,
          details: JSON.stringify({ name: created.name, variantsCount: variants.length }),
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: unknown) {
    console.error("Create product error:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to create product";
    const status = errorMsg.includes("Unauthorized") ? 401 : errorMsg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, message: errorMsg }, { status });
  }
}
