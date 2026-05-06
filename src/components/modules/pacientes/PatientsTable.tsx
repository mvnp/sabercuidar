"use client";

import { useState, useTransition, useCallback } from "react";
import { getPatients } from "@/actions/patients";
import Link from "next/link";
import {
  Search, UserPlus, RefreshCw, ChevronLeft, ChevronRight,
  User, MapPin, Phone, Bot, Pencil,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PatientAiPanel from "./PatientAiPanel";

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
  createdAt: Date;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// ─── Helpers ───
function formatCpf(cpf: string | null) {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
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

const statusStyles: Record<string, string> = {
  ativo:   "badge-success",
  inativo: "badge-neutral",
  alta:    "badge-info",
  suspeso: "badge-warning",
  obito:   "badge-danger",
};
const statusLabels: Record<string, string> = {
  ativo: "Ativo", inativo: "Inativo", alta: "Alta", suspeso: "Suspenso", obito: "Óbito",
};

// ─────────────────────────────────────────────
//  Componente
// ─────────────────────────────────────────────
interface PatientsTableProps {
  initialData: PatientRow[];
  initialPagination: Pagination;
  initialSearch?: string;
}

export default function PatientsTable({ initialData, initialPagination, initialSearch = "" }: PatientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);

  const fetchData = useCallback((page: number, q: string) => {
    startTransition(async () => {
      const result = await getPatients(page, initialPagination.pageSize, q || undefined);
      setData(result.data as PatientRow[]);
      setPagination(result.pagination);
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q); else params.delete("q");
      if (page > 1) params.set("page", String(page)); else params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [initialPagination.pageSize, pathname, router, searchParams]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchData(1, search);
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF..."
                className="input pl-icon h-9 text-sm"
              />
            </div>
            <button type="submit" className="btn btn-primary h-9 text-xs px-4" disabled={isPending}>
              {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Buscar"}
            </button>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/pacientes/novo" className="btn btn-primary h-9 text-xs">
              <UserPlus className="w-4 h-4" /> Novo Paciente
            </Link>
          </div>
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden">
          {data.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-brand-soft flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[var(--color-brand-400)]" />
              </div>
              <p className="font-semibold text-[var(--color-brand-900)]">Nenhum paciente encontrado</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {search ? "Tente uma busca diferente." : "Cadastre o primeiro paciente clicando em \"Novo Paciente\"."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-brand-50)]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Paciente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">CPF</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide hidden md:table-cell">Contato</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide hidden lg:table-cell">Cidade</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide hidden xl:table-cell">Admissão</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.map((p) => {
                    const age = calcAge(p.birthDate);
                    const phone = formatPhone(p.phone);
                    const waHref = p.phone
                      ? `https://wa.me/55${p.phone.replace(/\D/g, "")}`
                      : null;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[var(--color-brand-50)] transition-colors group"
                      >
                        {/* Paciente */}
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {p.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--color-brand-900)] group-hover:text-[var(--color-brand-700)] transition-colors">
                                {p.socialName || p.name}
                              </p>
                              {p.socialName && (
                                <p className="text-[11px] text-[var(--color-text-light)]">{p.name}</p>
                              )}
                              {age !== null && (
                                <p className="text-[11px] text-[var(--color-text-muted)]">{age} anos</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CPF */}
                        <td
                          className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs cursor-pointer"
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                        >
                          {formatCpf(p.cpf)}
                        </td>

                        {/* Contato — WhatsApp */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {waHref && phone ? (
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors group/wa"
                            >
                              {/* WhatsApp SVG icon */}
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 fill-current flex-shrink-0"
                                aria-hidden="true"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {phone}
                            </a>
                          ) : (
                            <span className="text-[var(--color-text-light)] text-xs flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> —
                            </span>
                          )}
                        </td>

                        {/* Cidade */}
                        <td
                          className="px-4 py-3 hidden lg:table-cell cursor-pointer"
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                        >
                          {p.city ? (
                            <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="text-xs">{p.city}{p.state ? ` / ${p.state}` : ""}</span>
                            </div>
                          ) : <span className="text-[var(--color-text-light)]">—</span>}
                        </td>

                        {/* Status */}
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                        >
                          <span className={`badge ${statusStyles[p.status] ?? "badge-neutral"}`}>
                            {statusLabels[p.status] ?? p.status}
                          </span>
                        </td>

                        {/* Admissão */}
                        <td
                          className="px-4 py-3 text-xs text-[var(--color-text-muted)] hidden xl:table-cell cursor-pointer"
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                        >
                          {p.admissionDate
                            ? new Date(p.admissionDate).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/pacientes/${p.id}/editar`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[var(--color-text-muted)] hover:text-[var(--color-brand-700)] border border-[var(--color-border)] hover:border-[var(--color-brand-200)] transition-colors whitespace-nowrap"
                              title="Editar Ficha"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(p);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] border border-[var(--color-brand-200)] transition-colors whitespace-nowrap"
                              title="Avaliar com IA"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              Avaliar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-brand-50)]">
              <p className="text-xs text-[var(--color-text-muted)]">
                {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total.toLocaleString()} pacientes
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="btn btn-ghost p-1.5 disabled:opacity-40"
                  onClick={() => fetchData(pagination.page - 1, search)}
                  disabled={pagination.page <= 1 || isPending}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[var(--color-text-muted)] px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="btn btn-ghost p-1.5 disabled:opacity-40"
                  onClick={() => fetchData(pagination.page + 1, search)}
                  disabled={pagination.page >= pagination.totalPages || isPending}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Painel de Avaliação IA */}
      <PatientAiPanel
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </>
  );
}
