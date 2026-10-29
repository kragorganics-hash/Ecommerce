import { describe, it, expect } from "vitest";

describe("Cart and Shipping Business Calculations", () => {
  const FREE_SHIPPING_THRESHOLD = 3500;
  const STANDARD_SHIPPING_FEE = 150;
  const EXPRESS_SHIPPING_FEE = 300;

  function calculateShipping(subtotal: number, method: "STANDARD" | "EXPRESS" = "STANDARD") {
    if (subtotal === 0) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return method === "EXPRESS" ? EXPRESS_SHIPPING_FEE - STANDARD_SHIPPING_FEE : 0;
    }
    return method === "EXPRESS" ? EXPRESS_SHIPPING_FEE : STANDARD_SHIPPING_FEE;
  }

  function applyDiscount(
    subtotal: number,
    discount: { type: "PERCENTAGE" | "FIXED_AMOUNT"; value: number; minSpend?: number }
  ) {
    if (discount.minSpend && subtotal < discount.minSpend) {
      return 0;
    }
    if (discount.type === "PERCENTAGE") {
      return Math.round((subtotal * discount.value) / 100);
    }
    return Math.min(discount.value, subtotal);
  }

  it("calculates standard domestic shipping fee below threshold", () => {
    expect(calculateShipping(2800, "STANDARD")).toBe(150);
  });

  it("grants free standard domestic delivery when order meets threshold", () => {
    expect(calculateShipping(3500, "STANDARD")).toBe(0);
    expect(calculateShipping(5800, "STANDARD")).toBe(0);
  });

  it("calculates express courier shipping correctly", () => {
    expect(calculateShipping(2000, "EXPRESS")).toBe(300);
    expect(calculateShipping(4000, "EXPRESS")).toBe(150);
  });

  it("applies percentage discount correctly", () => {
    const discount = { type: "PERCENTAGE" as const, value: 10, minSpend: 2000 };
    expect(applyDiscount(5000, discount)).toBe(500);
    expect(applyDiscount(1500, discount)).toBe(0); // below min spend
  });

  it("applies fixed amount rupee discount correctly", () => {
    const discount = { type: "FIXED_AMOUNT" as const, value: 500, minSpend: 4000 };
    expect(applyDiscount(6000, discount)).toBe(500);
    expect(applyDiscount(3000, discount)).toBe(0); // below min spend
  });
});
