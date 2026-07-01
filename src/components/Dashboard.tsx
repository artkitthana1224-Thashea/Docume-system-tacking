import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileClock, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { format } from "date-fns";

export function Dashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { headers: { "x-user-id": userId } })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [userId]);

  if (loading || !data) return <div className="animate-pulse">Loading dashboard...</div>;

  const { kpis, recentDocs } = data;

  const pieData = [
    { name: 'Pending', value: kpis.pending, color: '#f59e0b' },
    { name: 'Approved', value: kpis.approved, color: '#10b981' },
    { name: 'Overdue', value: kpis.overdue, color: '#ef4444' },
  ];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={kpis.total} icon={FileText} />
        <StatCard title="Pending Approvals" value={kpis.pending} icon={FileClock} />
        <StatCard title="Completed" value={kpis.approved} icon={CheckCircle} />
        <StatCard title="Overdue (SLA Breach)" value={kpis.overdue} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Document Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Recent Documents</h3>
          <div className="space-y-4">
            {recentDocs.length === 0 ? (
              <p className="text-sm text-gray-500">No recent documents.</p>
            ) : (
              recentDocs.map((doc: any) => (
                <div key={doc.id} className="flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-slate-900">{doc.runningNumber}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <span className="text-xs text-slate-500 truncate">{doc.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{format(new Date(doc.updatedAt), "MMM d, yyyy HH:mm")}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <p className="text-xs text-slate-400 font-semibold uppercase">{title}</p>
        <Icon size={16} className="text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const getColors = () => {
    if (status === "Approved") return "bg-green-50 text-green-700";
    if (status === "Rejected") return "bg-red-50 text-red-700 animate-pulse";
    if (status.includes("Pending")) return "bg-amber-50 text-amber-700";
    return "bg-slate-50 text-slate-500";
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getColors()}`}>
      {status}
    </span>
  );
}
