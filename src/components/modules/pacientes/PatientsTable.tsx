"use client";

import { useState, useTransition, useCallback } from "react";
import { getPatients } from "@/actions/patients";
import Link from "next/link";
import {
  Search, UserPlus, RefreshCw, ChevronLeft, ChevronRight,
  User, MapPin, Phone,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
  if (!phone) return "—";
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
  ativo:    "badge-success",
  inativo:  "badge-neutral",
  alta:     "badge-info",
  suspeso:  "badge-warning",
  obito:    "badge-danger",
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

  const fetchData = useCallback((page: number, q: string) => {
    startTransition(async () => {
      const result = await getPatients(page, initialPagination.pageSize, q || undefined);
      setData(result.data as PatientRow[]);
      setPagination(result.pagination);
      // Sincronizar URL
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.map((p) => {
                  const age = calcAge(p.birthDate);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--color-brand-50)] transition-colors cursor-pointer group"
                      onClick={() => router.push(`/pacientes/${p.id}`)}
                    >
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs">
                        {formatCpf(p.cpf)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.phone ? (
                          <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs">{formatPhone(p.phone)}</span>
                          </div>
                        ) : <span className="text-[var(--color-text-light)]">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {p.city ? (
                          <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs">{p.city}{p.state ? ` / ${p.state}` : ""}</span>
                          </div>
                        ) : <span className="text-[var(--color-text-light)]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusStyles[p.status] ?? "badge-neutral"}`}>
                          {statusLabels[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] hidden xl:table-cell">
                        {p.admissionDate
                          ? new Date(p.admissionDate).toLocaleDateString("pt-BR")
                          : "—"}
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
  );
}
