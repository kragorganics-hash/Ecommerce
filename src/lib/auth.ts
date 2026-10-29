import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_internal_auth_key_minimum_32_characters";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "krag_auth_token";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
}

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT session token
 */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify JWT token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as "ADMIN" | "CUSTOMER") || "CUSTOMER",
    };
  } catch {
    return null;
  }
}

/**
 * Get current session user from cookies in server components/actions/routes
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    // Verify user still exists in DB
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "CUSTOMER",
    };
  } catch {
    return null;
  }
}

/**
 * Guard for server actions and routes requiring authentication
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in to continue.");
  }
  return user;
}

/**
 * Guard for server actions and routes requiring admin permissions
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required.");
  }
  return user;
}
