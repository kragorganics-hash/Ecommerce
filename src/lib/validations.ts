import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(3, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(3, "Postal/ZIP code is required"),
  country: z.string().default("Nepal"),
  phone: z.string().min(7, "Valid phone number is required"),
  isDefaultShipping: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  // Contact
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Full name required"),
  phone: z.string().min(7, "Phone number required"),

  // Delivery Address
  addressLine1: z.string().min(3, "Street address required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State/Province required"),
  postalCode: z.string().min(3, "Postal code required"),
  country: z.string().default("Nepal"),

  // Shipping & Payment
  shippingMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  paymentMethod: z.enum(["ESEWA", "KHALTI", "COD", "TEST_CARD"]),
  promoCode: z.string().optional(),
  orderNotes: z.string().optional(),

  // Items from client (verified on server against DB!)
  items: z.array(
    z.object({
      productVariantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Your cart is empty"),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  authorName: z.string().min(2, "Name is required"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Product slug is required"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  ingredients: z.string().optional(),
  suggestedUsage: z.string().optional(),
  allergens: z.string().optional(),
  packageSize: z.string().optional(),
  basePrice: z.number().positive("Base price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url("Valid image URL required")).min(1, "At least one image is required"),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Variant name required"),
      flavor: z.string().optional(),
      weight: z.string().optional(),
      sku: z.string().min(2, "SKU required"),
      price: z.number().positive("Variant price must be positive"),
      compareAtPrice: z.number().positive().optional().nullable(),
      stock: z.number().int().nonnegative("Stock cannot be negative"),
    })
  ).min(1, "At least one product variant is required"),
});

export const discountSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().positive("Value must be positive"),
  minimumOrderAmount: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  variantId: z.string(),
  changeQuantity: z.number().int(),
  reason: z.enum(["RESTOCK", "DAMAGE", "ADJUSTMENT", "RETURN"]),
  notes: z.string().optional(),
});
