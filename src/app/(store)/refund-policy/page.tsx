import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6 text-sm text-[#2b322f] leading-relaxed">
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Customer Satisfaction
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716]">
          Returns & Refund Policy
        </h1>
        <p className="text-xs text-[#5c6b64]">
          Transparent Resolution Guidelines
        </p>

        <section className="space-y-3 pt-4 border-t border-[#f3eee3]">
          <h2 className="font-serif text-lg font-bold text-[#141716]">1. 14-Day Unopened Return Window</h2>
          <p>
            You may return any unopened supplement product in its original packaging with the factory neck seal intact within 14 days of physical delivery for a full product refund or exchange.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">2. Damaged or Defective Items</h2>
          <p>
            If your package arrives with a compromised safety seal, cracked container, or incorrect variant, please photograph the parcel and notify us within 48 hours at <strong className="text-[#1b3b2c]">care@kragorganic.com</strong>. We will arrange a free immediate replacement dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">3. Refund Processing Time</h2>
          <p>
            Approved refunds will be credited back via the original payment method (eSewa or Khalti balance) within 3 to 5 business days, or via direct bank transfer for Cash on Delivery orders upon parcel return inspection.
          </p>
        </section>
      </div>
    </div>
  );
}
