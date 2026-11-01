import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { signSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account/orders";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  const supabase = await createClient();
  let authenticatedUser = null;

  // 1. Handle PKCE code flow (Google OAuth or email confirmation with code)
  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && data.user) {
      authenticatedUser = data.user;
    } else if (exchangeError) {
      console.error("Code exchange failed:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // 2. Handle token hash flow (direct Supabase email verification links)
  if (!authenticatedUser && token_hash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!verifyError && data.user) {
      authenticatedUser = data.user;
    } else if (verifyError) {
      console.error("Verify OTP failed:", verifyError.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(verifyError.message)}`
      );
    }
  }

  // 3. Fallback: check if supabase already has active user session
  if (!authenticatedUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      authenticatedUser = user;
    }
  }

  // If user authenticated successfully
  if (authenticatedUser && authenticatedUser.email) {
    const email = authenticatedUser.email.toLowerCase().trim();
    const metadata = authenticatedUser.user_metadata || {};
    const name = metadata.full_name || metadata.name || email.split("@")[0] || "Customer";
    const phone = metadata.phone || authenticatedUser.phone || null;

    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          phone,
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

    const redirectPath = user.role === "ADMIN" && next === "/account/orders" ? "/admin" : next;
    const response = NextResponse.redirect(`${origin}${redirectPath}`);

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  }

  return NextResponse.redirect(
    `${origin}/login?error=Invalid+or+expired+verification+link.+Please+try+signing+in+again.`
  );
}
