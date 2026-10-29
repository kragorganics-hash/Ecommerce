import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword, signSessionToken, verifySessionToken } from "../src/lib/auth";

describe("Authentication & RBAC Security", () => {
  it("hashes password with salt and successfully verifies match", async () => {
    const rawPassword = "SecurePassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await comparePassword("WrongPassword123", hash);
    expect(isWrong).toBe(false);
  });

  it("signs and verifies JWT session tokens with roles", async () => {
    const payload = {
      id: "user_test_123",
      email: "admin@kragorganic.com",
      name: "Admin User",
      role: "ADMIN" as const,
    };

    const token = await signSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe("ADMIN");
  });

  it("rejects corrupted or tampered tokens", async () => {
    const tampered = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.payload";
    const result = await verifySessionToken(tampered);
    expect(result).toBeNull();
  });
});
