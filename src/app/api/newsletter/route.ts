import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Upsert subscription
    await db.newsletterSubscription.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true },
      create: { email: email.toLowerCase(), isActive: true, source: "FOOTER" },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to Krag Organic wellness updates!",
    });
  } catch (err: unknown) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json({ success: false, message: "Could not process subscription." }, { status: 500 });
  }
}
