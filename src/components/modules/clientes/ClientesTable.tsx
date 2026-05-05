"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Loader2,
  Layers,
  ExternalLink
} from "lucide-react";
import AdvancedFilters from "./AdvancedFilters";
import SavedSearchesModal from "./SavedSearchesModal";
import { getEmpresasAvancado, getEmpresas } from "@/actions/empresas";

interface Empresa {
  cnpjBasico: string;
  razaoSocial: string;
  porteEmpresa: string;
  capitalSocial: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ClientesTableProps {
  initialData: Empresa[];
  pagination: Pagination;
}

interface Filters {
  cnaes: string;
  municipios: string;
  onlyWithFantasyName: boolean;
}

export default function ClientesTable({ initialData, pagination: initialPagination }: ClientesTableProps) {
  const [data, setData] = useState<Empresa[]>(initialData);
  const [isFiltered, setIsFiltered] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [activeFilters, setActiveFilters] = useState<Filters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPagination.pageSize);

  const handleAdvancedSearch = (results: Empresa[], newPagination: Pagination, filters: Filters) => {
    setData(results);
    setIsFiltered(true);
    setPagination(newPagination);
    setActiveFilters(filters);
  };

  const handleSavedSearchSelect = async (filters: Filters) => {
    setIsLoading(true);
    try {
      const result = await getEmpresasAvancado({ ...filters, page: 1, pageSize });
      setData(result.data as Empresa[]);
      setPagination(result.pagination as Pagination);
      setIsFiltered(true);
      setActiveFilters(filters);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = async (newSize: number) => {
    setPageSize(newSize);
    setIsLoading(true);
    try {
      let result;
      if (isFiltered && activeFilters) {
        result = await getEmpresasAvancado({ ...activeFilters, page: 1, pageSize: newSize });
      } else {
        result = await getEmpresas(1, newSize);
      }
      setData(result.data as Empresa[]);
      setPagination(result.pagination as Pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setIsLoading(true);
    try {
      let result;
      if (isFiltered && activeFilters) {
        result = await getEmpresasAvancado({
          ...activeFilters,
          page: newPage,
          pageSize
        });
      } else {
        result = await getEmpresas(newPage, pageSize);
      }
      setData(result.data as Empresa[]);
      setPagination(result.pagination as Pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPage = pagination.page;

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <input
              type="text"
              placeholder="Filtrar por Razão Social ou CNPJ..."
              className="input pl-icon h-10"
              onChange={(e) => {
                if (e.target.value === "" && isFiltered) {
                  setData(initialData);
                  setIsFiltered(false);
                  setPagination(initialPagination);
                  setActiveFilters(null);
                }
              }}
            />
          </div>

          {/* Page Size Select */}
          <div className="relative group min-w-[100px]">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-600)]" />
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="input pl-icon pr-10 h-10 appearance-none cursor-pointer text-sm font-semibold text-[var(--color-brand-800)] bg-[var(--color-brand-50)]/30 border-[var(--color-brand-100)]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-brand-600)]">
              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const result = await getEmpresas(1, 100);
                setData(result.data as Empresa[]);
                setPagination(result.pagination as Pagination);
                setIsFiltered(false);
                setActiveFilters(null);
                setPageSize(100);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch (error) {
                console.error(error);
              } finally {
                setIsLoading(false);
              }
            }}
            className="btn btn-ghost h-10 px-3 text-danger border border-transparent hover:bg-danger/10"
          >
            Limpar Busca
          </button>
          <SavedSearchesModal onSelect={handleSavedSearchSelect} />
          <AdvancedFilters onSearch={handleAdvancedSearch} />
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden bg-white border-[var(--color-border)] shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-600)]" />
          </div>
        )}

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
                      <div className="flex items-center gap-2">
                        <span>{empresa.razaoSocial}</span>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(empresa.razaoSocial)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-brand-50)] text-[var(--color-brand-700)] rounded-lg text-[10px] font-bold border border-[var(--color-brand-100)] hover:bg-[var(--color-brand-600)] hover:text-white hover:border-[var(--color-brand-600)] transition-all uppercase tracking-tight shadow-sm"
                          title="Pesquisar no Google"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
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
                    Nenhuma empresa encontrada.
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
            {isFiltered && <span className="ml-2 text-[var(--color-brand-600)] font-medium">(Filtros Ativos)</span>}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className={`btn btn-secondary h-9 w-9 p-0 justify-center ${currentPage <= 1 ? 'opacity-50' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`btn h-9 w-9 p-0 justify-center text-xs ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {pagination.totalPages > 5 && currentPage + 2 < pagination.totalPages && (
                <span className="px-1 text-[var(--color-text-light)]">...</span>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages || isLoading}
              className={`btn btn-secondary h-9 w-9 p-0 justify-center ${currentPage >= pagination.totalPages ? 'opacity-50' : ''}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isFiltered && (
          <div className="px-6 py-2 bg-[var(--color-brand-100)]/20 border-t border-[var(--color-border)] flex items-center justify-center">
            <button
              onClick={() => {
                setData(initialData);
                setIsFiltered(false);
                setPagination(initialPagination);
                setActiveFilters(null);
                setPageSize(initialPagination.pageSize);
              }}
              className="text-[10px] text-[var(--color-brand-600)] hover:underline font-bold uppercase tracking-wider"
            >
              Limpar filtros e voltar para lista completa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
