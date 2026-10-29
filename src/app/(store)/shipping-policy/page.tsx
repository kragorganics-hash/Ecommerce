import React from "react";
import { Truck, Clock, MapPin, Shield } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6 text-sm text-[#2b322f] leading-relaxed">
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Nationwide Fulfillment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716]">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-[#5c6b64]">
          Domestic Shipping Rules across all 7 Provinces of Nepal
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl flex items-start space-x-3">
            <Truck className="w-5 h-5 text-[#1b3b2c] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-[#141716]">Free Domestic Delivery</p>
              <p className="text-xs text-[#5c6b64] mt-0.5">Orders over Rs. 3,500 qualify for free standard shipping anywhere in Nepal.</p>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl flex items-start space-x-3">
            <Clock className="w-5 h-5 text-[#1b3b2c] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-[#141716]">Kathmandu Valley Same/Next Day</p>
              <p className="text-xs text-[#5c6b64] mt-0.5">Orders placed before 1:00 PM are dispatched for same or next-day delivery.</p>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-[#1b3b2c] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-[#141716]">Major Cities (2-3 Days)</p>
              <p className="text-xs text-[#5c6b64] mt-0.5">Pokhara, Biratnagar, Butwal, Chitwan, Dharan, Nepalgunj via express road/air courier.</p>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[#1b3b2c] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-[#141716]">Tamper-Proof Seal Guarantee</p>
              <p className="text-xs text-[#5c6b64] mt-0.5">All supplement containers are sealed with airtight induction neck bands.</p>
            </div>
          </div>
        </div>

        <section className="space-y-3 pt-4 border-t border-[#f3eee3]">
          <h2 className="font-serif text-lg font-bold text-[#141716]">Standard Rates & Schedule</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#5c6b64]">
            <li>Standard Shipping Fee: Flat Rs. 150 (Free for orders &gt; Rs. 3,500)</li>
            <li>Express Priority Courier: Rs. 300 (Rs. 150 for orders &gt; Rs. 3,500)</li>
            <li>Remote Himalayan Districts: 3 to 5 business days via Nepal Post Registered Air Parcel.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
