export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Bem-vindo ao painel de controle do SaberCuidar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-[var(--color-brand-500)]">
          <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Total de Pacientes</div>
          <div className="text-3xl font-bold text-[var(--color-brand-900)]">--</div>
        </div>
        <div className="card p-6 border-l-4 border-l-[var(--color-calm-500)]">
          <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Visitas Hoje</div>
          <div className="text-3xl font-bold text-[var(--color-brand-900)]">--</div>
        </div>
        <div className="card p-6 border-l-4 border-l-[var(--color-success)]">
          <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Medicações Pendentes</div>
          <div className="text-3xl font-bold text-[var(--color-brand-900)]">--</div>
        </div>
      </div>

      <div className="card p-12 flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-2 border-[var(--color-brand-200)]">
        <div className="w-16 h-16 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-brand-800)]">Em construção</h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
          Estamos preparando os melhores gráficos e métricas para você.
        </p>
      </div>
    </div>
  );
}
