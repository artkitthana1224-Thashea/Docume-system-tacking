/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { DocumentList } from "./components/DocumentList";
import { DocumentDetail } from "./components/DocumentDetail";
import { DocumentForm } from "./components/DocumentForm";
import { AuditLogs } from "./components/AuditLogs";
import { SettingsView } from "./components/SettingsView";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState("u1");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewDocId, setViewDocId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch("/api/me", { headers: { "x-user-id": userId } })
      .then(res => res.json())
      .then(u => setUser(u));
  }, [userId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setViewDocId(null);
    setIsCreating(false);
  };

  const handleViewDoc = (id: string) => {
    setViewDocId(id);
    setIsCreating(false);
  };

  const handleCreateDoc = () => {
    setIsCreating(true);
    setViewDocId(null);
  };

  const isListView = [
    "loan-verify", "loan-incomplete", "loan-pending-sign", "loan-send-finance", "loan-track", "loan-history",
    "finance-receive", "finance-verify", "finance-confirm", "finance-send-admin", "finance-sla", "finance-pending",
    "contract-loan", "contract-borrow", "contract-mortgage", "contract-guarantee", "contract-poa", "contract-cert", "contract-support", "contract-history",
    "cust-individual", "cust-corporate", "cust-guarantor", "cust-collateral", "cust-relations", "cust-history"
  ].includes(activeTab);

  const isSettingsView = activeTab.startsWith("set-") || activeTab.startsWith("master-") || activeTab.startsWith("prof-");

  const formatTitle = (id: string) => {
    return id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Layout user={user} onUserChange={setUserId} activeTab={activeTab} onTabChange={handleTabChange}>
      {isCreating ? (
        <DocumentForm 
          userId={userId} 
          onCancel={() => handleTabChange("dashboard")} 
          onSuccess={(id) => {
            setIsCreating(false);
            setViewDocId(id);
          }} 
        />
      ) : viewDocId ? (
        <DocumentDetail id={viewDocId} userId={userId} user={user} onBack={() => setViewDocId(null)} />
      ) : activeTab === "dashboard" ? (
        <Dashboard userId={userId} />
      ) : activeTab === "loan-create" ? (
        <DocumentForm 
          userId={userId} 
          onCancel={() => handleTabChange("dashboard")} 
          onSuccess={(id) => {
            setViewDocId(id);
          }} 
        />
      ) : isListView ? (
        <DocumentList userId={userId} onViewDoc={handleViewDoc} onCreateDoc={handleCreateDoc} />
      ) : isSettingsView ? (
        <SettingsView title={formatTitle(activeTab)} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white border border-slate-200 rounded-xl border-dashed">
          <p className="text-sm font-medium">This module ({activeTab}) is under construction.</p>
        </div>
      )}
    </Layout>
  );
}
