import { getEmpresas } from "@/actions/empresas";
import {
  Building2,
  Download
} from "lucide-react";
import ClientesTable from "@/components/modules/clientes/ClientesTable";

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

      {error ? (
        <div className="card p-12 text-center text-danger">
          {error}
        </div>
      ) : (
        <ClientesTable 
          initialData={data} 
          pagination={{
            ...pagination,
            page: currentPage,
          }} 
        />
      )}
    </div>
  );
}
