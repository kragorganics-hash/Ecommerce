import React from "react";
import { db } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";


export default async function AdminSettingsPage() {
  const settings = await db.storeSetting.findMany();

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Store Settings & Domestic Logistics
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Configure branding, support contact details, delivery fees, and announcement bar notifications.
        </p>
      </div>

      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}
