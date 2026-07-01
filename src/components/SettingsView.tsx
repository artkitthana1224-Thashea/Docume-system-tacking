import React from "react";
import { Save, Settings2, Database, Shield, Globe } from "lucide-react";

export function SettingsView({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">Configure parameters for {title.toLowerCase()}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Configuration</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
                  defaultValue="Enabled"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Threshold Limit</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
                  defaultValue="100"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security Level</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors">
                  <option>Standard (Recommended)</option>
                  <option>High (Strict)</option>
                  <option>Maximum (Internal Only)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Environment</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors">
                  <option>Production</option>
                  <option>Staging</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={14} className="text-green-500" />
              <span>All changes are tracked in Audit Logs</span>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 flex items-center gap-2 transition-colors">
              <Save size={16} />
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Database size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Database Sync</h4>
            <p className="text-xs text-slate-500 mt-1">Changes applied here will automatically sync with the core banking database within 5 minutes.</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Globe size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">API Webhooks</h4>
            <p className="text-xs text-slate-500 mt-1">3 active webhooks are currently listening to updates on this configuration module.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
