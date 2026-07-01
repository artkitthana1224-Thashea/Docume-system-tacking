import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, X, Printer, Download, History, ShieldCheck, Clock } from "lucide-react";
import { StatusBadge } from "./Dashboard";
import { User } from "../types";

export function DocumentDetail({ id, userId, onBack, user }: { id: string, userId: string, onBack: () => void, user: User | null }) {
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoc = () => {
    Promise.all([
      fetch(`/api/documents/${id}`, { headers: { "x-user-id": userId } }).then(res => res.json()),
      fetch("/api/users").then(res => res.json())
    ]).then(([d, u]) => {
      setData(d);
      setUsers(u);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDoc();
    
    // Log view action
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ docId: id, action: "View", details: "Viewed document details" })
    });
  }, [id, userId]);

  const handleAction = async (action: 'approve' | 'reject') => {
    await fetch(`/api/documents/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ action })
    });
    fetchDoc(); // refresh
  };

  if (loading || !data) return <div className="animate-pulse">Loading document...</div>;

  const { doc, logs } = data;
  
  const canApprove = 
    (user?.role === "Unit Head" && doc.status === "Pending Unit Head") ||
    (user?.role === "Manager" && doc.status === "Pending Manager");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={onBack} className="self-start flex items-center gap-2 text-slate-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-wider transition-colors">
          <ArrowLeft size={16} />
          Back to list
        </button>
        <div className="flex gap-2 sm:gap-3">
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-2 sm:py-1.5 rounded text-xs font-semibold hover:bg-slate-50">
            <Printer size={14} /> Print
          </button>
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-2 sm:py-1.5 rounded text-xs font-semibold hover:bg-slate-50">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Doc Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Watermark for draft/rejected */}
            {doc.status === "Rejected" && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
                <span className="text-6xl sm:text-8xl font-black uppercase rotate-[-30deg] text-red-500 text-center leading-none">REJECTED</span>
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
              <div className="w-full">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-tight">{doc.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono">
                  <span className="inline-block bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-500 text-[10px] uppercase font-bold tracking-wider w-fit">Ref: {doc.runningNumber}</span>
                  <span className="text-slate-400">Created: {format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <div className="bg-white p-1.5 border border-slate-200 rounded inline-block">
                  <QRCodeSVG value={`https://bank-dms.internal/doc/${doc.id}`} size={64} level="M" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Scan to Track</div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-slate-700 border-t border-b border-slate-100 py-6 min-h-[150px] sm:min-h-[200px]">
              {doc.content}
            </div>

            {/* Signatures */}
            {doc.signatures.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-600" />
                  Digital Signatures
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {doc.signatures.map((sig: any, idx: number) => (
                    <div key={idx} className="border border-green-100 bg-green-50/50 p-3 rounded flex flex-col items-center text-center">
                      <span className="text-green-700 font-bold text-[10px] uppercase tracking-wider">Signed ({sig.role})</span>
                      <span className="text-xs text-slate-500 mt-1">{format(new Date(sig.timestamp), "MMM d, yyyy HH:mm")}</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-2 bg-white px-2 py-0.5 rounded border border-slate-200 truncate w-full" title={sig.hash}>
                        Hash: {sig.hash}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Approval Actions */}
          {canApprove && (
            <div className="bg-blue-50 border border-blue-100 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-blue-900">Approval Required</h3>
                <p className="text-xs text-blue-700 mt-1">This document is pending your review as {user?.role}.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => handleAction('reject')}
                  className="flex-1 sm:flex-none justify-center bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 sm:px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <X size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleAction('approve')}
                  className="flex-1 sm:flex-none justify-center bg-blue-700 text-white hover:bg-blue-800 px-3 sm:px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & SLA */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-[10px] uppercase tracking-wider">Workflow Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Current Status</span>
                <StatusBadge status={doc.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">SLA Due Date</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Clock size={14} className="text-slate-400" />
                  {format(new Date(doc.dueDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Versions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-[10px] uppercase tracking-wider flex items-center gap-2">
              <History size={14} /> Version History
            </h3>
            <div className="space-y-3">
              {doc.versions.map((v: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    {i < doc.versions.length - 1 && <div className="w-px h-full bg-slate-200 my-1"></div>}
                  </div>
                  <div className="pb-3 w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 text-xs">v{v.version}.0</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{format(new Date(v.timestamp), "MMM d, HH:mm")}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">By: {users.find(u => u.id === v.updatedBy)?.name || v.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-h-80 overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-4 text-[10px] uppercase tracking-wider">Audit Trail</h3>
            <div className="space-y-3 text-xs">
              {logs.map((log: any) => (
                <div key={log.id} className="border-l-2 border-slate-200 pl-3 py-1">
                  <p className="font-semibold text-slate-900 text-xs">{log.action}</p>
                  <p className="text-slate-500 text-[11px]">{log.details}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{format(new Date(log.timestamp), "MMM d, HH:mm:ss")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
