import { describe, it, expect } from "vitest";
import { getPaymentProvider, EsewaPaymentProvider, KhaltiPaymentProvider, CodPaymentProvider, TestCardPaymentProvider } from "../src/lib/payments";

describe("Payment Provider Abstraction", () => {
  it("resolves the proper provider class according to payment method key", () => {
    expect(getPaymentProvider("esewa")).toBeInstanceOf(EsewaPaymentProvider);
    expect(getPaymentProvider("khalti")).toBeInstanceOf(KhaltiPaymentProvider);
    expect(getPaymentProvider("cod")).toBeInstanceOf(CodPaymentProvider);
    expect(getPaymentProvider("test_card")).toBeInstanceOf(TestCardPaymentProvider);
  });

  it("throws error for unsupported payment provider", () => {
    expect(() => getPaymentProvider("unsupported_method")).toThrow("Unsupported payment method");
  });

  it("initiates eSewa payment with HMAC-SHA256 signature and merchant parameters", async () => {
    const provider = new EsewaPaymentProvider();
    const result = await provider.initiatePayment({
      orderId: "ord_123",
      orderNumber: "KRAG-2026-1001",
      amount: 5800,
      customerName: "Siddhartha Thapa",
      customerEmail: "siddhartha@example.com",
      returnUrl: "http://localhost:3000/api/payments/verify",
      failureUrl: "http://localhost:3000/checkout?error=failed",
    });

    expect(result.success).toBe(true);
    expect(result.paymentMethod).toBe("ESEWA");
    expect(result.formData).toBeDefined();
    expect(result.formData?.product_code).toBe("EPAYTEST");
    expect(result.formData?.signature).toBeDefined();
    expect(result.formData?.total_amount).toBe("5800");
  });

  it("handles Cash on Delivery initiation without fake successful charge", async () => {
    const provider = new CodPaymentProvider();
    const result = await provider.initiatePayment({
      orderId: "ord_cod_123",
      orderNumber: "KRAG-2026-1002",
      amount: 4200,
      customerName: "Prashant Karki",
      customerEmail: "prashant@example.com",
      returnUrl: "http://localhost:3000/api/payments/verify",
      failureUrl: "http://localhost:3000/checkout?error=failed",
    });

    expect(result.success).toBe(true);
    expect(result.paymentMethod).toBe("COD");

    // Verification must return PENDING status until physically delivered
    const verify = await provider.verifyPayment({ orderId: "ord_cod_123" });
    expect(verify.status).toBe("PENDING");
  });

  it("simulates Sandbox Card payment explicitly marked as test mode", async () => {
    const provider = new TestCardPaymentProvider();
    const result = await provider.initiatePayment({
      orderId: "ord_card_123",
      orderNumber: "KRAG-2026-1003",
      amount: 3500,
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      returnUrl: "http://localhost:3000/api/payments/verify",
      failureUrl: "http://localhost:3000/checkout?error=failed",
    });

    expect(result.success).toBe(true);
    expect(result.paymentMethod).toBe("TEST_CARD");
    expect(result.transactionId?.startsWith("TEST_CARD_")).toBe(true);
  });
});
