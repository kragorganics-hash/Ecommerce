import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: { orderBy: { isDefaultShipping: "desc" } },
      },
    });

    return NextResponse.json({ success: true, profile: fullUser });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.type === "UPDATE_NAME") {
      const { name, phone } = body;
      const updated = await db.user.update({
        where: { id: user.id },
        data: { name, phone },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (body.type === "ADD_ADDRESS") {
      const parsed = addressSchema.safeParse(body.address);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      if (parsed.data.isDefaultShipping) {
        await db.address.updateMany({
          where: { userId: user.id },
          data: { isDefaultShipping: false },
        });
      }

      const newAddress = await db.address.create({
        data: {
          ...parsed.data,
          userId: user.id,
        },
      });

      return NextResponse.json({ success: true, address: newAddress });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating profile";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
