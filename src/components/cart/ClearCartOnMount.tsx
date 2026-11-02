"use client";

import { useEffect } from "react";
import { useCart } from "@/features/cart/CartContext";

export function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
