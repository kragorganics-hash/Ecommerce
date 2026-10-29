import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6 text-sm text-[#2b322f] leading-relaxed">
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Legal & Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#5c6b64]">
          Last revised: October 2026 | Operating Territory: Nepal
        </p>

        <section className="space-y-3 pt-4 border-t border-[#f3eee3]">
          <h2 className="font-serif text-lg font-bold text-[#141716]">1. Information We Collect</h2>
          <p>
            At Krag Organic, we prioritize customer confidentiality and minimal data collection. When you place an order or create an account, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Contact details: Name, email address, and mobile phone number for delivery coordination.</li>
            <li>Delivery address: Physical location, province, city, and postal code for dispatch via certified couriers.</li>
            <li>Order history: Historical purchases, transaction reference tokens, and applied discount vouchers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">2. Payment Card Security</h2>
          <p>
            We strictly do not collect, process, or store raw credit/debit card numbers or sensitive banking credentials on our servers. All digital payments (eSewa, Khalti, or card sandbox) are encrypted and routed directly through the respective regulated payment gateway APIs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">3. Use of Information</h2>
          <p>
            Your information is used strictly to fulfill supplement orders, provide status updates via SMS/email, verify inventory transactions, and deliver our optional health & sports nutrition newsletter when opted-in.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">4. Contact Our Privacy Officer</h2>
          <p>
            For any queries, account data export, or deletion requests, please contact: <strong className="text-[#1b3b2c]">privacy@kragorganic.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
