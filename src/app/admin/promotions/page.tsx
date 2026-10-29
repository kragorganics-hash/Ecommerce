import React from "react";
import { db } from "@/lib/db";
import { PromotionsManager } from "./PromotionsManager";


export default async function AdminPromotionsPage() {
  const discounts = await db.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { redemptions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Marketing & Growth
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Promotions & Coupon Codes
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Create percentage discounts, rupee cash-off vouchers, minimum order thresholds, and usage caps.
        </p>
      </div>

      <PromotionsManager initialDiscounts={discounts} />
    </div>
  );
}
