"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  variantName: string;
  flavor?: string | null;
  weight?: string | null;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface AppliedDiscount {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  amount: number;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: AppliedDiscount | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "krag_organic_cart_v1";
const DISCOUNT_STORAGE_KEY = "krag_organic_discount_v1";
const FREE_SHIPPING_THRESHOLD = 3500;
const STANDARD_SHIPPING_FEE = 150;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
      if (storedDiscount) {
        setDiscount(JSON.parse(storedDiscount));
      }
    } catch (e) {
      console.error("Failed to parse cart from storage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage:", e);
    }
  }, [items, isInitialized]);

  // Save discount to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (discount) {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discount));
      } else {
        localStorage.removeItem(DISCOUNT_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save discount to storage:", e);
    }
  }, [discount, isInitialized]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Compute discount amount
  let discountAmount = 0;
  if (discount) {
    if (discount.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * discount.value) / 100);
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }
  }

  // Shipping calculation
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.maxStock);
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock) }];
    });
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId === variantId) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      })
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(null);
  };

  const applyPromoCode = async (code: string) => {
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderSubtotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Invalid discount code" };
      }
      setDiscount(data.discount);
      return { success: true, message: data.message || "Discount applied successfully!" };
    } catch {
      return { success: false, message: "Error validating coupon code. Please try again." };
    }
  };

  const removePromoCode = () => {
    setDiscount(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        discountAmount,
        shippingFee,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
