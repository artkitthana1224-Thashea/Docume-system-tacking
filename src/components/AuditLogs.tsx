import React, { useEffect, useState } from "react";
import { format } from "date-fns";

export function AuditLogs({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/audit-logs", { headers: { "x-user-id": userId } }).then(res => res.json()),
      fetch("/api/users").then(res => res.json())
    ]).then(([l, u]) => {
      setLogs(l);
      setUsers(u);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div className="animate-pulse">Loading logs...</div>;

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <h2 className="font-bold text-slate-800">System Audit Trail</h2>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document ID</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs whitespace-nowrap">{format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{getUserName(log.userId)}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase">{log.action}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-blue-600">{log.docId.substring(0, 8)}...</td>
                <td className="px-6 py-4 text-sm">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
