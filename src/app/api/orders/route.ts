import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors, message: "Invalid order information" },
        { status: 400 }
      );
    }

    const {
      email,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      shippingMethod,
      paymentMethod,
      promoCode,
      orderNotes,
      items: rawItems,
    } = parsed.data;

    // Fetch and lock/validate variant details from database (SERVER-SIDE PRICE & INVENTORY VALIDATION)
    const variantIds = rawItems.map((i) => i.productVariantId);
    const dbVariants = await db.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { product: true },
    });

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // Validate existence & stock for each item
    let calculatedSubtotal = 0;
    interface ValidatedOrderItem {
      productVariantId: string;
      productId: string;
      productName: string;
      variantName: string;
      sku: string;
      price: number;
      quantity: number;
      subtotal: number;
    }
    const validatedOrderItems: ValidatedOrderItem[] = [];

    for (const item of rawItems) {
      const dbVariant = variantMap.get(item.productVariantId);
      if (!dbVariant) {
        return NextResponse.json(
          { success: false, message: `Product variant not found or inactive.` },
          { status: 400 }
        );
      }

      if (dbVariant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${dbVariant.product.name} (${dbVariant.name})". Only ${dbVariant.stock} available.`,
          },
          { status: 400 }
        );
      }

      const itemSubtotal = dbVariant.price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        productVariantId: dbVariant.id,
        productId: dbVariant.productId,
        productName: dbVariant.product.name,
        variantName: dbVariant.name,
        sku: dbVariant.sku,
        price: dbVariant.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Server-side discount calculation
    let discountTotal = 0;
    let validDiscountRecord = null;

    if (promoCode) {
      const discount = await db.discount.findUnique({
        where: { code: promoCode.trim().toUpperCase() },
      });

      if (
        discount &&
        discount.isActive &&
        calculatedSubtotal >= discount.minimumOrderAmount &&
        (!discount.maxUses || discount.usedCount < discount.maxUses)
      ) {
        validDiscountRecord = discount;
        if (discount.discountType === "PERCENTAGE") {
          discountTotal = Math.round((calculatedSubtotal * discount.value) / 100);
        } else {
          discountTotal = Math.min(discount.value, calculatedSubtotal);
        }
      }
    }

    // Shipping calculation
    const freeShippingThreshold = 3500;
    const standardFee = 150;
    const expressFee = 300;
    let shippingTotal = 0;

    if (calculatedSubtotal < freeShippingThreshold) {
      shippingTotal = shippingMethod === "EXPRESS" ? expressFee : standardFee;
    } else if (shippingMethod === "EXPRESS") {
      shippingTotal = expressFee - standardFee; // discounted express
    }

    const finalTotal = Math.max(0, calculatedSubtotal - discountTotal + shippingTotal);
    const orderNumber = generateOrderNumber();

    // Execute atomic transaction: Create Order, Items, Decrement Inventory, Create InventoryLogs, Redeem Coupon
    const order = await db.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          guestEmail: email,
          guestName: name,
          guestPhone: phone,
          shippingFullName: name,
          shippingAddress1: addressLine1,
          shippingAddress2: addressLine2 || null,
          shippingCity: city,
          shippingState: state,
          shippingPostalCode: postalCode,
          shippingCountry: country,
          shippingPhone: phone,
          status: "PENDING",
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          subtotal: calculatedSubtotal,
          discountTotal,
          shippingTotal,
          taxTotal: 0,
          total: finalTotal,
          currency: "NPR",
          paymentMethod,
          notes: orderNotes || null,
          items: {
            create: validatedOrderItems.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      // 2. Decrement stock and write InventoryLog for each item
      for (const item of validatedOrderItems) {
        const currentVariant = await tx.productVariant.findUniqueOrThrow({
          where: { id: item.productVariantId },
        });

        const newStock = Math.max(0, currentVariant.stock - item.quantity);

        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: newStock },
        });

        await tx.inventoryLog.create({
          data: {
            productVariantId: item.productVariantId,
            changeQuantity: -item.quantity,
            previousStock: currentVariant.stock,
            newStock,
            reason: "SALE",
            notes: `Sold via Order ${orderNumber}`,
          },
        });
      }

      // 3. Record discount redemption if applied
      if (validDiscountRecord) {
        await tx.discount.update({
          where: { id: validDiscountRecord.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.discountRedemption.create({
          data: {
            discountId: validDiscountRecord.id,
            orderId: newOrder.id,
            userId: user?.id || null,
            amountApplied: discountTotal,
          },
        });
      }

      // 4. Create initial Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paymentMethod,
          amount: finalTotal,
          status: "PENDING",
        },
      });

      return newOrder;
    });

    // Initiate payment via abstraction provider
    const provider = getPaymentProvider(paymentMethod);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const paymentInitiate = await provider.initiatePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      returnUrl: `${appUrl}/api/payments/verify`,
      failureUrl: `${appUrl}/checkout?error=payment_failed`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      payment: paymentInitiate,
    });
  } catch (err: unknown) {
    console.error("Order processing error:", err);
    return NextResponse.json(
      { success: false, message: "An error occurred while creating your order. Please try again." },
      { status: 500 }
    );
  }
}
