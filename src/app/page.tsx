import Link from "next/link";
import {
  Heart,
  Home,
  Pill,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Ficha Médica Completa",
    desc: "Prontuário digital integrado com histórico clínico, alergias, diagnósticos e muito mais.",
  },
  {
    icon: Home,
    title: "Visitas Domiciliares",
    desc: "Agendamento, check-in/out, evolução clínica e assinatura digital do paciente.",
  },
  {
    icon: Pill,
    title: "Gestão Medicamentosa",
    desc: "Prescrições digitais, horários de administração e registro de cada dose aplicada.",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    desc: "Visitas, medicações e compromissos sincronizados com toda a equipe.",
  },
  {
    icon: Users,
    title: "Rede de Profissionais",
    desc: "Médicos, enfermeiros, fisioterapeutas e cuidadores em um só lugar.",
  },
  {
    icon: Shield,
    title: "Dados Protegidos",
    desc: "Conformidade com a LGPD. Seus dados e os de seus pacientes em segurança total.",
  },
];

const highlights = [
  "Receita Federal integrada para validação de CPF/CNPJ",
  "Inteligência Artificial para análise clínica",
  "Deploy em nuvem com disponibilidade 24/7",
  "Acesso em qualquer dispositivo",
];

export default function HomePage() {
  return (
    <div className="min-h-dvh gradient-brand-soft">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="page-container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg text-[var(--color-brand-900)] tracking-tight">
              Saber<span className="text-[var(--color-brand-600)]">Cuidar</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <a href="#features" className="hover:text-[var(--color-brand-600)] transition-colors">Funcionalidades</a>
            <a href="#about" className="hover:text-[var(--color-brand-600)] transition-colors">Sobre</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary text-sm">
              Entrar
            </Link>
            <Link href="/dashboard" className="btn btn-primary text-sm">
              Acessar sistema
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Decoração de fundo */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand-300) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand-400) 0%, transparent 70%)",
          }}
        />

        <div className="page-container relative">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge badge-brand mb-6 text-sm py-1.5 px-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] animate-pulse" />
              Sistema completo de Home Care
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-brand-900)] leading-[1.15] mb-6">
              Cuidar bem começa com{" "}
              <span className="text-[var(--color-brand-600)]">organização</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl leading-relaxed">
              O SaberCuidar centraliza a ficha médica dos seus pacientes, as
              visitas domiciliares, a administração de medicamentos e toda a
              equipe de profissionais — tudo em um sistema pensado para quem
              cuida de verdade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="btn btn-primary text-base py-3 px-6">
                Acessar o sistema
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn btn-secondary text-base py-3 px-6">
                Ver funcionalidades
              </a>
            </div>

            {/* Destaques */}
            <ul className="mt-10 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <CheckCircle className="w-4 h-4 text-[var(--color-brand-500)] flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-[var(--color-brand-600)]">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {[
              { value: "100%", label: "Seguro e privado" },
              { value: "24/7", label: "Disponível sempre" },
              { value: "LGPD", label: "Em conformidade" },
              { value: "IA", label: "Inteligência integrada" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm text-teal-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 md:py-28">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-brand-900)] mb-4">
              Tudo que você precisa em um lugar
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              Desenvolvido por quem entende a rotina do Home Care — para
              profissionais que não têm tempo a perder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card p-6 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-100)] flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-[var(--color-brand-600)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-brand-900)] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section id="about" className="py-20">
        <div className="page-container">
          <div className="card p-10 md:p-14 text-center gradient-brand-soft border-[var(--color-brand-200)]">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-brand">
              <Heart className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-brand-900)] mb-4">
              Pronto para começar?
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto mb-8">
              Acesse o sistema agora e comece a organizar o cuidado dos seus
              pacientes de forma profissional e eficiente.
            </p>
            <Link href="/dashboard" className="btn btn-primary text-base py-3 px-8">
              Entrar no sistema
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-[var(--color-border)] bg-white/60">
        <div className="page-container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-medium text-[var(--color-brand-900)]">SaberCuidar</span>
          </div>
          <p>© {new Date().getFullYear()} SaberCuidar. Sistema privado de uso interno.</p>
          <p>Feito com cuidado 💚</p>
        </div>
      </footer>
    </div>
  );
}
