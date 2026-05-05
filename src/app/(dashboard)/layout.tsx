import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Pill, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  User,
  ChevronDown,
  Menu
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-dvh bg-[var(--color-brand-50)]">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white border-r border-[var(--color-border)] z-50">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[var(--color-brand-900)] tracking-tight">
              Saber<span className="text-[var(--color-brand-600)]">Cuidar</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider px-3 mb-2">
            Principal
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/clientes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
          >
            <Users className="w-4 h-4" />
            Clientes
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
          >
            <Calendar className="w-4 h-4" />
            Visitas
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
          >
            <Pill className="w-4 h-4" />
            Medicações
          </Link>

          <div className="pt-6">
            <div className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider px-3 mb-2">
              Sistema
            </div>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <form action={logoutAction}>
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden btn btn-ghost p-1">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input 
                type="text" 
                placeholder="Buscar paciente ou prontuário..." 
                className="input pl-10 h-9 w-64 md:w-80 bg-[var(--color-brand-50)] border-transparent focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="btn btn-ghost p-2 relative text-[var(--color-text-muted)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-[var(--color-border)] mx-1"></div>

            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-[var(--color-brand-900)] leading-none mb-0.5">
                  {session.user.name}
                </div>
                <div className="text-[10px] font-medium text-[var(--color-brand-600)] uppercase tracking-wider">
                  {session.user.role}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-[var(--color-brand-200)] p-0.5 overflow-hidden bg-[var(--color-brand-100)]">
                <img 
                  src={session.user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--color-text-light)] hidden md:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
