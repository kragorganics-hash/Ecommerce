import React from "react";
import { db } from "@/lib/db";
import { CustomerList } from "./CustomerList";


export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: {
        select: { id: true, total: true, paymentStatus: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          User Directory
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Registered Customer Accounts ({customers.length})
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          View member profiles, contact numbers, order frequency, and lifetime spend history.
        </p>
      </div>

      <CustomerList initialCustomers={customers} />
    </div>
  );
}
