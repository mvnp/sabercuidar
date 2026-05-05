import { getEmpresas } from "@/actions/empresas";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Download
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam || "1", 10);
  const pageSize = 25;

  const { data, pagination, error } = await getEmpresas(currentPage, pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
            Clientes
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Visualizando dados da Receita Federal ({pagination.total.toLocaleString()} registros encontrados)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary text-xs h-9">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button className="btn btn-primary text-xs h-9">
            <Building2 className="w-3.5 h-3.5" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
          <input
            type="text"
            placeholder="Filtrar por Razão Social ou CNPJ..."
            className="input pl-icon h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost h-10 px-3 text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand-300)]">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden bg-white border-[var(--color-border)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-brand-50)]/50 border-b border-[var(--color-border)]">
                <th className="px-6 py-4 text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider">CNPJ Básico</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider">Razão Social</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider">Porte</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider">Capital Social</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--color-brand-800)] uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.length > 0 ? (
                data.map((empresa) => (
                  <tr key={empresa.cnpjBasico} className="hover:bg-[var(--color-brand-50)]/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-brand-900)]">
                      {empresa.cnpjBasico}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text)] font-medium">
                      {empresa.razaoSocial}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-brand">
                        Porte {empresa.porteEmpresa}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                      R$ {parseFloat(empresa.capitalSocial).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded-md hover:bg-white text-[var(--color-text-light)] hover:text-[var(--color-brand-600)] transition-colors border border-transparent hover:border-[var(--color-brand-200)]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    {error ? (
                      <span className="text-danger">{error}</span>
                    ) : (
                      "Nenhuma empresa encontrada."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-[var(--color-brand-50)]/30 border-t border-[var(--color-border)] flex items-center justify-between gap-4">
          <div className="text-sm text-[var(--color-text-muted)]">
            Mostrando <span className="font-semibold text-[var(--color-brand-900)]">{((currentPage - 1) * pageSize) + 1}</span> a <span className="font-semibold text-[var(--color-brand-900)]">{Math.min(currentPage * pageSize, pagination.total)}</span> de <span className="font-semibold text-[var(--color-brand-900)]">{pagination.total.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={currentPage > 1 ? `/clientes?page=${currentPage - 1}` : "#"}
              className={`btn btn-secondary h-9 w-9 p-0 justify-center ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <Link
                    key={pageNum}
                    href={`/clientes?page=${pageNum}`}
                    className={`btn h-9 w-9 p-0 justify-center text-xs ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              {pagination.totalPages > 5 && currentPage + 2 < pagination.totalPages && (
                <span className="px-1 text-[var(--color-text-light)]">...</span>
              )}
            </div>

            <Link
              href={currentPage < pagination.totalPages ? `/clientes?page=${currentPage + 1}` : "#"}
              className={`btn btn-secondary h-9 w-9 p-0 justify-center ${currentPage >= pagination.totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
