import React, { useState } from "react";
import { X, Save } from "lucide-react";

export function DocumentForm({ userId, onCancel, onSuccess }: { userId: string, onCancel: () => void, onSuccess: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ title, content, dueDate })
    });
    const data = await res.json();
    setLoading(false);
    onSuccess(data.id);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Create New Document</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Document Title</label>
          <input 
            required
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
            placeholder="e.g. Loan Request - ACME Corp"
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Content / Details</label>
          <textarea 
            required
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none transition-colors"
            placeholder="Document content..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SLA Due Date (Optional)</label>
          <input 
            type="date" 
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
          />
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Create Document"}
          </button>
        </div>
      </form>
    </div>
  );
}
