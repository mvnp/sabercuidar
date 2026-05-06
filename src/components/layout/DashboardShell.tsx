"use client";

import { useState } from "react";
import { toggleSidebarAction } from "@/actions/ui";
import { 
  Heart, 
  Search, 
  Bell,
  LogOut,
  Menu
} from "lucide-react";
import Link from "next/link";
import UserMenu from "@/components/modules/UserMenu";
import SidebarLink from "@/components/ui/SidebarLink";
import { logoutAction } from "@/actions/auth";

interface DashboardShellProps {
  children: React.ReactNode;
  initialCollapsed: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  };
}

export default function DashboardShell({ 
  children, 
  initialCollapsed,
  user
}: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = async () => {
    // Instant UI update
    setIsCollapsed(!isCollapsed);
    // Background cookie update
    await toggleSidebarAction();
  };

  return (
    <div className="flex min-h-dvh bg-[var(--color-brand-50)]">
      {/* ── Sidebar ── */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-[var(--color-border)] z-50 transition-all duration-300 ${
          isCollapsed ? "w-[78px]" : "w-72"
        }`}
      >
        <div className={`h-16 flex items-center border-b border-[var(--color-border)] px-5 ${isCollapsed ? "justify-center" : ""}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg gradient-brand flex-shrink-0 flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-[var(--color-brand-900)] tracking-tight whitespace-nowrap animate-fade-in">
                Saber<span className="text-[var(--color-brand-600)]">Cuidar</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider px-3 mb-2">
              Principal
            </div>
          )}
          <SidebarLink href="/dashboard" iconName="LayoutDashboard" label="Dashboard" isCollapsed={isCollapsed} />
          <SidebarLink href="/clientes" iconName="Users" label="Clientes" isCollapsed={isCollapsed} />
          <SidebarLink href="/pacientes" iconName="Users2" label="Pacientes" isCollapsed={isCollapsed} />
          <SidebarLink href="#" iconName="Calendar" label="Visitas" isCollapsed={isCollapsed} />
          <SidebarLink href="#" iconName="Pill" label="Medicações" isCollapsed={isCollapsed} />

          <div className="pt-6">
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider px-3 mb-2">
                Sistema
              </div>
            )}
            <SidebarLink href="/configuracoes" iconName="Settings" label="Configurações" isCollapsed={isCollapsed} />
          </div>
        </nav>

        <div className={`p-3 border-t border-[var(--color-border)] ${isCollapsed ? "flex justify-center" : ""}`}>
          <form action={logoutAction}>
            <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors ${isCollapsed ? "justify-center" : ""}`}>
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="animate-fade-in">Sair da conta</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-[78px]" : "lg:pl-72"
        }`}
      >
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] z-40 flex items-center justify-between px-[30px]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className="p-1 -ml-2 text-[var(--color-brand-700)] transition-colors active:opacity-70"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="input pl-icon h-9 w-48 md:w-64 bg-[var(--color-brand-50)] border-transparent focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="btn btn-ghost p-2 relative text-[var(--color-text-muted)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-[var(--color-border)] mx-1"></div>
            <UserMenu user={user} />
          </div>
        </header>

        <div className="flex-1 p-[30px]">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
