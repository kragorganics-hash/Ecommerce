import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid review content" },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment, authorName } = parsed.data;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // Check if user has purchased this product
    let isVerifiedPurchase = false;
    if (user) {
      const pastPurchased = await db.orderItem.findFirst({
        where: {
          productId: product.id,
          order: {
            userId: user.id,
            paymentStatus: { in: ["PAID", "SUCCESS"] },
          },
        },
      });
      if (pastPurchased) {
        isVerifiedPurchase = true;
      }
    }

    const newReview = await db.productReview.create({
      data: {
        productId: product.id,
        userId: user?.id || null,
        authorName: user?.name || authorName,
        rating,
        title: title || null,
        comment,
        isVerifiedPurchase,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been published.",
      review: newReview,
    });
  } catch (err: unknown) {
    console.error("Review submission error:", err);
    return NextResponse.json({ success: false, message: "Failed to submit review" }, { status: 500 });
  }
}
