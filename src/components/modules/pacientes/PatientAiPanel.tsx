"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import {
  Bot, X, Loader2, AlertCircle, Maximize2, Minimize2,
  User, Phone, MapPin, Calendar, Zap,
  ChevronDown, ChevronUp,
} from "lucide-react";
import {
  evaluatePatientAction,
  getPatientEvaluationsAction,
  getPatientRateLimitAction,
} from "@/actions/ai";

// ─── Tipos ───
type PatientRow = {
  id: string;
  name: string;
  socialName: string | null;
  cpf: string | null;
  birthDate: string | null;
  gender: string;
  phone: string | null;
  status: string;
  city: string | null;
  state: string | null;
  admissionDate: string | null;
};

type Evaluation = {
  id: string;
  model: string;
  response: string;
  createdAt: Date;
};

// ─── Helpers ───
function formatPhone(phone: string | null) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
}

function calcAge(birthDate: string | null) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const statusLabels: Record<string, string> = {
  ativo: "Ativo", inativo: "Inativo", alta: "Alta", suspeso: "Suspenso", obito: "Óbito",
};

// ─── Componente de Laudo ───
function EvaluationCard({ evaluation, index }: { evaluation: Evaluation; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [fullscreen, setFullscreen] = useState(false);

  const date = new Date(evaluation.createdAt).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      {/* ── Fullscreen Overlay ── */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[var(--color-border)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-brand-900)]">Laudo IA — {evaluation.model}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{date}</p>
              </div>
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] border border-[var(--color-brand-200)] transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Recolher
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-sm max-w-none text-base text-[var(--color-text-muted)] leading-relaxed
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--color-brand-900)] [&_h1]:mb-3
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--color-brand-900)] [&_h2]:mt-5 [&_h2]:mb-2
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--color-brand-800)] [&_h3]:mt-4 [&_h3]:mb-1
              [&_strong]:text-[var(--color-brand-900)] [&_strong]:font-semibold
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
              [&_li]:text-[var(--color-text-muted)]
              [&_p]:mb-3 [&_p]:leading-relaxed
              [&_hr]:border-[var(--color-border)] [&_hr]:my-4
              [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-brand-300)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--color-text-muted)]
              bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-inner">
              <ReactMarkdown>{evaluation.response}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* ── Card Normal ── */}
      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-brand-50)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center gap-2.5 text-left"
          >
            <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-900)]">
                Laudo IA — {evaluation.model}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{date}</p>
            </div>
          </button>
          <div className="flex items-center gap-1 ml-2">
            {expanded && (
              <button
                onClick={() => setFullscreen(true)}
                className="p-1.5 rounded-lg text-[var(--color-text-light)] hover:text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] transition-colors"
                title="Expandir laudo"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-[var(--color-text-light)] hover:bg-[var(--color-brand-100)] transition-colors"
            >
              {expanded
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {expanded && (
          <div className="p-4">
            <div className="text-base text-[var(--color-text-muted)] leading-relaxed
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--color-brand-900)] [&_h1]:mb-3
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--color-brand-900)] [&_h2]:mt-4 [&_h2]:mb-2
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--color-brand-800)] [&_h3]:mt-3 [&_h3]:mb-1
              [&_strong]:text-[var(--color-brand-900)] [&_strong]:font-semibold
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
              [&_li]:text-[var(--color-text-muted)]
              [&_p]:mb-3 [&_p]:leading-relaxed
              [&_hr]:border-[var(--color-border)] [&_hr]:my-3">
              <ReactMarkdown>{evaluation.response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Painel Principal ───
interface PatientAiPanelProps {
  patient: PatientRow | null;
  onClose: () => void;
}

export default function PatientAiPanel({ patient, onClose }: PatientAiPanelProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rateLimit, setRateLimit] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isOpen = !!patient;
  const age = patient ? calcAge(patient.birthDate) : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Carregar histórico quando abre o painel
  useEffect(() => {
    if (!patient) return;
    const pid = patient.id;
    setEvaluations([]);
    setError(null);
    setLoadingHistory(true);

    Promise.all([
      getPatientEvaluationsAction(pid),
      getPatientRateLimitAction(pid),
    ]).then(([evalsResult, rateResult]) => {
      setEvaluations((evalsResult.data as Evaluation[]) ?? []);
      setRateLimit(rateResult);
      setLoadingHistory(false);
    });
  }, [patient]);

  function handleEvaluate() {
    if (!patient) return;
    setError(null);
    startTransition(async () => {
      const result = await evaluatePatientAction(patient.id);
      if ("error" in result && result.error) {
        setError(result.error as string);
      } else if ("success" in result && result.success && result.response) {
        // Adiciona novo laudo no topo
        const newEval: Evaluation = {
          id: crypto.randomUUID(),
          model: "IA",
          response: result.response,
          createdAt: new Date(),
        };
        setEvaluations((prev) => [newEval, ...prev]);
        setRateLimit((prev) =>
          prev ? { ...prev, used: prev.used + 1, remaining: Math.max(0, prev.remaining - 1) } : prev
        );
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-white/60 backdrop-blur-md z-[998] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 w-full md:w-[50vw] bg-white shadow-2xl z-[999] flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {patient && (
          <>
            {/* ── Cabeçalho do Paciente ── */}
            <div className="gradient-brand p-6 text-white flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg leading-tight">
                      {patient.socialName || patient.name}
                    </h2>
                    {patient.socialName && (
                      <p className="text-white/70 text-xs">{patient.name}</p>
                    )}
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20`}>
                      {statusLabels[patient.status] ?? patient.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {age !== null && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <User className="w-4 h-4 text-white/70" />
                    <span>{age} anos</span>
                  </div>
                )}
                {patient.phone && (
                  <a
                    href={`https://wa.me/55${patient.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-white/70" />
                    <span>{formatPhone(patient.phone)}</span>
                  </a>
                )}
                {(patient.city || patient.state) && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <span>{[patient.city, patient.state].filter(Boolean).join(" / ")}</span>
                  </div>
                )}
                {patient.admissionDate && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-white/70" />
                    <span>
                      Admissão: {new Date(patient.admissionDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Ação de Avaliação ── */}
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
              {error && (
                <div className="flex items-start gap-2 p-3 mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-brand-900)]">Avaliação por IA</p>
                  {rateLimit && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      Usadas:{" "}
                      <span className={rateLimit.remaining === 0 ? "text-red-500 font-semibold" : "text-[var(--color-brand-600)] font-semibold"}>
                        {rateLimit.used}/{rateLimit.limit}
                      </span>{" "}
                      nas últimas 24h
                    </p>
                  )}
                </div>
                <button
                  onClick={handleEvaluate}
                  disabled={isPending || (rateLimit?.remaining === 0)}
                  className="btn btn-primary text-xs gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analisando...</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" /> Gerar Laudo IA</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Histórico de Laudos ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Histórico de Laudos
              </p>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[var(--color-brand-500)] animate-spin" />
                </div>
              ) : evaluations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl gradient-brand-soft flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-7 h-7 text-[var(--color-brand-400)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-brand-900)]">
                    Nenhum laudo gerado
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Clique em &quot;Gerar Laudo IA&quot; para iniciar a análise
                  </p>
                </div>
              ) : (
                evaluations.map((ev, i) => (
                  <EvaluationCard key={ev.id} evaluation={ev} index={i} />
                ))
              )}
            </div>
          </>
        )}
      </aside>
    </>,
    document.body
  );
}
