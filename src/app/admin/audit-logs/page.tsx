import React from "react";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { ShieldCheck, History } from "lucide-react";


export default async function AdminAuditLogsPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      admin: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
          Security & Compliance
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#141716] mt-1">
          Administrative Audit Trail ({logs.length})
        </h1>
        <p className="text-xs text-[#5c6b64] mt-1">
          Chronological immutable record of order modifications, inventory restocks, product changes, and store settings updates.
        </p>
      </div>

      <div className="bg-white border border-[#e6dfd3] rounded-2xl overflow-hidden shadow-xs">
        {logs.length === 0 ? (
          <p className="text-xs text-[#5c6b64] py-12 text-center">
            No administrative operations recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#fbf9f5] border-b border-[#e6dfd3] text-[#85958d] font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Operator / Admin</th>
                  <th className="py-3 px-4">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3eee3]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fbf9f5]/70">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5c6b64] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1b3b2c] bg-[#e8f0eb] px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#141716]">
                      {log.entityType}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#141716]">
                        {log.admin?.name || "System Automated"}
                      </div>
                      {log.admin?.email && (
                        <div className="text-[10px] text-[#85958d]">{log.admin.email}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5c6b64] max-w-md truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
