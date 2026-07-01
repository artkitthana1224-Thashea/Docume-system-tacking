import React, { useState } from "react";
import { LayoutDashboard, FileText, CheckSquare, History, Settings, LogOut, UserCircle, Database, Users, Briefcase, CreditCard, FolderOpen, ChevronDown, ChevronRight, User as UserIcon, Menu as MenuIcon, X as CloseIcon, PlusCircle, Bell } from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onUserChange: (userId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, user, onUserChange, activeTab, onTabChange }: LayoutProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: false,
    loan: true,
    finance: false,
    contracts: false,
    customers: false,
    master: false,
    settings: false,
    profile: false,
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sidebarSections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      items: []
    },
    {
      id: "loan",
      title: "ฝ่ายสินเชื่อ",
      icon: Briefcase,
      items: [
        { id: "loan-create", label: "สร้างรายการ" },
        { id: "loan-verify", label: "ตรวจสอบเอกสาร" },
        { id: "loan-incomplete", label: "เอกสารไม่ครบ" },
        { id: "loan-pending-sign", label: "รอลายเซ็น" },
        { id: "loan-send-finance", label: "ส่งการเงิน" },
        { id: "loan-track", label: "ติดตามสถานะ" },
        { id: "loan-history", label: "ประวัติการส่ง" }
      ]
    },
    {
      id: "finance",
      title: "ฝ่ายการเงิน",
      icon: CreditCard,
      items: [
        { id: "finance-receive", label: "รับเอกสาร" },
        { id: "finance-verify", label: "ตรวจสอบ" },
        { id: "finance-confirm", label: "ยืนยันความถูกต้อง" },
        { id: "finance-send-admin", label: "ส่งธุรการ" },
        { id: "finance-sla", label: "ติดตาม SLA" },
        { id: "finance-pending", label: "รายการค้างดำเนินการ" }
      ]
    },
    {
      id: "contracts",
      title: "จัดการสัญญา",
      icon: FolderOpen,
      items: [
        { id: "contract-loan", label: "สัญญาสินเชื่อ" },
        { id: "contract-borrow", label: "สัญญากู้" },
        { id: "contract-mortgage", label: "สัญญาจำนอง" },
        { id: "contract-guarantee", label: "สัญญาค้ำประกัน" },
        { id: "contract-poa", label: "หนังสือมอบอำนาจ" },
        { id: "contract-cert", label: "หนังสือรับรอง" },
        { id: "contract-support", label: "เอกสารประกอบ" },
        { id: "contract-history", label: "ประวัติการแก้ไข" }
      ]
    },
    {
      id: "customers",
      title: "ข้อมูลลูกค้า",
      icon: Users,
      items: [
        { id: "cust-individual", label: "ลูกค้าบุคคล" },
        { id: "cust-corporate", label: "ลูกค้านิติบุคคล" },
        { id: "cust-guarantor", label: "ผู้ค้ำประกัน" },
        { id: "cust-collateral", label: "เจ้าของหลักประกัน" },
        { id: "cust-relations", label: "ความสัมพันธ์ลูกค้า" },
        { id: "cust-history", label: "ประวัติลูกค้า" }
      ]
    },
    {
      id: "master",
      title: "Master Data",
      icon: Database,
      items: [
        { id: "master-loan-type", label: "ประเภทสินเชื่อ" },
        { id: "master-col-type", label: "ประเภทหลักประกัน" },
        { id: "master-cust-type", label: "ประเภทลูกค้า" },
        { id: "master-contract-type", label: "ประเภทสัญญา" },
        { id: "master-doc-type", label: "ประเภทเอกสาร" },
        { id: "master-status-type", label: "ประเภทสถานะ" },
        { id: "master-missing-reason", label: "เหตุผลเอกสารไม่ครบ" },
        { id: "master-cancel-reason", label: "เหตุผลการยกเลิก" }
      ]
    },
    {
      id: "settings",
      title: "System Settings",
      icon: Settings,
      items: [
        { id: "set-company", label: "Company Profile" },
        { id: "set-branch", label: "Branch Configuration" },
        { id: "set-running", label: "Running Number" },
        { id: "set-workflow", label: "Workflow Setting" },
        { id: "set-sla", label: "SLA Setting" },
        { id: "set-notify", label: "Notification Setting" },
        { id: "set-upload", label: "File Upload Setting" },
        { id: "set-security", label: "Security Setting" },
        { id: "set-backup", label: "Backup" },
        { id: "set-restore", label: "Restore" },
        { id: "set-api", label: "API Setting" }
      ]
    },
    {
      id: "profile",
      title: "My Profile",
      icon: UserIcon,
      items: [
        { id: "prof-info", label: "ข้อมูลส่วนตัว" },
        { id: "prof-pass", label: "เปลี่ยนรหัสผ่าน" },
        { id: "prof-avatar", label: "รูปโปรไฟล์" },
        { id: "prof-notify", label: "การแจ้งเตือน" },
        { id: "prof-history", label: "ประวัติการใช้งาน" }
      ]
    }
  ];

  const getActiveTabTitle = () => {
    if (activeTab === "dashboard") return "Dashboard";
    for (const section of sidebarSections) {
      const item = section.items.find(i => i.id === activeTab);
      if (item) return item.label;
    }
    return activeTab.replace("-", " ");
  };

  const handleTabSelection = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs italic">CB</span>
          </div>
          <span className="font-bold tracking-tight text-blue-900">AYA SYSTEM</span>
        </div>
        <button 
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          onClick={() => setMobileMenuOpen(false)}
        >
          <CloseIcon size={20} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-0 custom-scrollbar pb-24 md:pb-4">
        {sidebarSections.map((section) => {
          const Icon = section.icon;
          const isDashboard = section.id === "dashboard";
          const isExpanded = expandedSections[section.id];
          
          if (isDashboard) {
            const isActive = activeTab === "dashboard";
            return (
              <button
                key={section.id}
                onClick={() => handleTabSelection("dashboard")}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <Icon size={18} />
                {section.title}
              </button>
            );
          }

          return (
            <div key={section.id} className="space-y-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {section.title}
                </div>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isExpanded && (
                <div className="pl-9 space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelection(item.id)}
                        className={cn(
                          "block w-full text-left px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-medium transition-colors",
                          isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-white">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role Switcher (Simulation)</div>
        <select 
          className="w-full bg-slate-50 text-sm text-slate-700 border border-slate-200 rounded p-2 focus:ring-blue-500 outline-none"
          value={user?.id || ""}
          onChange={(e) => onUserChange(e.target.value)}
        >
          <option value="u1">Somchai (Officer)</option>
          <option value="u2">Suda (Unit Head)</option>
          <option value="u3">Mana (Manager)</option>
          <option value="u4">Wichai (Admin)</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-0 z-50 bg-slate-900/50 transition-opacity md:hidden",
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setMobileMenuOpen(false)}>
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 w-[280px] bg-white flex flex-col transition-transform transform duration-300 ease-in-out z-50",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )} 
          onClick={e => e.stopPropagation()}
        >
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-[60px] md:pb-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 capitalize truncate max-w-[200px] md:max-w-md">
              {getActiveTabTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Core API: Connected</span>
            </div>
            
            <button className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full">
              <Bell size={18} />
            </button>
            
            <div className="flex items-center gap-3 md:p-2 md:bg-slate-50 rounded-lg md:border border-slate-100">
               <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
                 <UserCircle size={20} className="text-slate-500 md:w-4 md:h-4" />
               </div>
               <div className="flex flex-col text-left hidden sm:flex">
                 <span className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-tighter leading-tight">{user?.department} Dept</span>
               </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-[60px] z-40 pb-safe">
        <button 
          onClick={() => handleTabSelection("dashboard")}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", activeTab === "dashboard" ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        
        <button 
          onClick={() => handleTabSelection("loan-create")}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", activeTab === "loan-create" ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
        >
          <PlusCircle size={20} />
          <span className="text-[10px] font-bold">New</span>
        </button>

        <button 
          onClick={() => handleTabSelection("loan-verify")}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", activeTab === "loan-verify" ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
        >
          <CheckSquare size={20} />
          <span className="text-[10px] font-bold">Tasks</span>
        </button>

        <button 
          onClick={() => setMobileMenuOpen(true)}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", mobileMenuOpen ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
        >
          <MenuIcon size={20} />
          <span className="text-[10px] font-bold">Menu</span>
        </button>
      </nav>
    </div>
  );
}
