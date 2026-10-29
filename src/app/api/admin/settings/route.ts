import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.storeSetting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ success: true, settings: settingsMap, raw: settings });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load store settings";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json(); // Array of { key, value, description } or object

    const entries = Array.isArray(body)
      ? body
      : Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));

    for (const item of entries) {
      await db.storeSetting.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: {
          key: item.key,
          value: String(item.value),
          description: item.description || null,
        },
      });
    }

    await db.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_STORE_SETTINGS",
        entityType: "SETTINGS",
        details: JSON.stringify({ keysUpdated: entries.map((e) => e.key) }),
      },
    });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
  }
}
