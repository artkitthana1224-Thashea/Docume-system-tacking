import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Search, Eye, AlertCircle } from "lucide-react";
import { StatusBadge } from "./Dashboard";

export function DocumentList({ userId, onViewDoc, onCreateDoc }: { userId: string, onViewDoc: (id: string) => void, onCreateDoc: () => void }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents", { headers: { "x-user-id": userId } })
      .then(res => res.json())
      .then(d => {
        setDocs(d);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="animate-pulse">Loading documents...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search running number..." 
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={onCreateDoc}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Document
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Running No.</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Due Date</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {docs.map(doc => {
              const isOverdue = new Date(doc.dueDate) < new Date() && doc.status !== "Approved";
              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">{doc.runningNumber}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{doc.title}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                        {format(new Date(doc.dueDate), "MMM d, yyyy")}
                      </span>
                      {isOverdue && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onViewDoc(doc.id)}
                      className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
            {docs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
