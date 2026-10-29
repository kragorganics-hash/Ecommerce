import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6 text-sm text-[#2b322f] leading-relaxed">
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Terms & Disclaimers
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716]">
          Terms of Service
        </h1>
        <p className="text-xs text-[#5c6b64]">
          Effective Date: October 2026
        </p>

        <section className="space-y-3 pt-4 border-t border-[#f3eee3]">
          <h2 className="font-serif text-lg font-bold text-[#141716]">1. Store Platform Purpose</h2>
          <p>
            Krag Organic provides nutritional sports supplements, grass-fed proteins, and wellness formulations. All products are intended solely for athletic training and dietary support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">2. Medical & Health Disclaimer</h2>
          <p>
            Content on this website is for informational and educational purposes only. Products sold here are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified medical physician or registered sports dietitian before beginning any new supplementation protocol, particularly if you are pregnant, nursing, or have a pre-existing medical condition.
          </p>
          <p className="text-xs text-[#85958d] italic">
            *Notice: Sample store data and placeholder nutritional facts are provided for technical demonstration and require physical laboratory verification before commercial manufacture.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#141716]">3. Order Acceptance & Pricing</h2>
          <p>
            Prices are listed in Nepalese Rupees (NPR). Krag Organic reserves the right to decline or cancel orders resulting from inadvertent typographical errors or inventory stock discrepancies.
          </p>
        </section>
      </div>
    </div>
  );
}
