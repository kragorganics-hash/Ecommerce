import React from "react";
import { db } from "@/lib/db";
import { InventoryManager } from "./InventoryManager";


export default async function AdminInventoryPage() {
  const variants = await db.productVariant.findMany({
    where: { isActive: true },
    orderBy: { stock: "asc" },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Warehouse Operations
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Inventory Control & Stock Adjustments
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Monitor formulation stock levels, log restock movements, and resolve low inventory warnings.
        </p>
      </div>

      <InventoryManager initialVariants={variants} />
    </div>
  );
}
