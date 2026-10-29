import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, checkoutSchema, productSchema, discountSchema } from "../src/lib/validations";

describe("Input Validation & Integrity Schemas", () => {
  it("validates login credentials correctly", () => {
    const valid = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({ email: "invalid-email", password: "password123" });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = loginSchema.safeParse({ email: "user@example.com", password: "123" });
    expect(shortPassword.success).toBe(false);
  });

  it("validates checkout information strictly", () => {
    const validOrder = {
      email: "customer@example.com",
      name: "Siddhartha Thapa",
      phone: "+977 9841234567",
      addressLine1: "House 42, Shanti Marga",
      city: "Kathmandu",
      state: "Bagmati Province",
      postalCode: "44600",
      country: "Nepal",
      shippingMethod: "STANDARD" as const,
      paymentMethod: "ESEWA" as const,
      items: [{ productVariantId: "var_123", quantity: 2 }],
    };

    expect(checkoutSchema.safeParse(validOrder).success).toBe(true);

    // Empty items cart
    const emptyOrder = { ...validOrder, items: [] };
    expect(checkoutSchema.safeParse(emptyOrder).success).toBe(false);
  });

  it("validates product creation schema with variants and images", () => {
    const validProduct = {
      name: "Krag Whey Isolate",
      slug: "krag-whey-isolate",
      description: "Clean cold-filtered protein powder",
      basePrice: 5800,
      categoryId: "cat_123",
      images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d"],
      variants: [
        {
          name: "Vanilla / 1kg",
          sku: "WHEY-VAN-1",
          price: 5800,
          stock: 25,
        },
      ],
    };

    expect(productSchema.safeParse(validProduct).success).toBe(true);

    // Negative stock should fail
    const invalidStock = {
      ...validProduct,
      variants: [{ ...validProduct.variants[0], stock: -5 }],
    };
    expect(productSchema.safeParse(invalidStock).success).toBe(false);
  });

  it("validates promotional coupon rules", () => {
    const validCoupon = {
      code: "SUMMER10",
      discountType: "PERCENTAGE" as const,
      value: 10,
      minimumOrderAmount: 2000,
      isActive: true,
    };

    expect(discountSchema.safeParse(validCoupon).success).toBe(true);

    const invalidValue = {
      ...validCoupon,
      value: -15, // must be positive
    };
    expect(discountSchema.safeParse(invalidValue).success).toBe(false);
  });
});
