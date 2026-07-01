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

  return (
    <Layout user={user} onUserChange={setUserId} activeTab={activeTab} onTabChange={handleTabChange}>
      {isCreating ? (
        <DocumentForm 
          userId={userId} 
          onCancel={() => setIsCreating(false)} 
          onSuccess={(id) => {
            setIsCreating(false);
            setViewDocId(id);
          }} 
        />
      ) : viewDocId ? (
        <DocumentDetail id={viewDocId} userId={userId} user={user} onBack={() => setViewDocId(null)} />
      ) : activeTab === "dashboard" ? (
        <Dashboard userId={userId} />
      ) : activeTab === "loan-verify" || activeTab === "finance-receive" || activeTab === "finance-verify" || activeTab === "finance-confirm" || activeTab === "finance-sla" || activeTab === "loan-history" || activeTab === "finance-pending" ? (
        <DocumentList userId={userId} onViewDoc={handleViewDoc} onCreateDoc={handleCreateDoc} />
      ) : activeTab === "loan-create" ? (
        <DocumentForm 
          userId={userId} 
          onCancel={() => handleTabChange("dashboard")} 
          onSuccess={(id) => {
            setViewDocId(id);
          }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white border border-slate-200 rounded-xl border-dashed">
          <p className="text-sm font-medium">This module is under construction.</p>
        </div>
      )}
    </Layout>
  );
}
