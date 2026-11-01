import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { signSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    let email = authUser?.email;
    let name = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name;
    let phone = authUser?.user_metadata?.phone || authUser?.phone;

    if (!email) {
      const body = await req.json().catch(() => ({}));
      if (body.email) {
        email = body.email;
        name = body.name || name;
        phone = body.phone || phone;
      }
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: userError?.message || "No authenticated user or email found." },
        { status: 401 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          phone: phone || null,
          role: "CUSTOMER",
        },
      });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "CUSTOMER",
    };

    const token = await signSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Synced Supabase user session",
      user: sessionUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Supabase sync error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to synchronize user session" },
      { status: 500 }
    );
  }
}
