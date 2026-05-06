import { getPatients } from "@/actions/patients";
import { Users } from "lucide-react";
import PatientsTable from "@/components/modules/pacientes/PatientsTable";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export const metadata = {
  title: "Pacientes | SaberCuidar",
  description: "Listagem e gestão dos pacientes em atendimento domiciliar",
};

export default async function PacientesPage({ searchParams }: PageProps) {
  const { page: pageParam, q } = await searchParams;
  const currentPage = parseInt(pageParam || "1", 10);
  const search = q || "";

  const { data, pagination, error } = await getPatients(currentPage, 20, search || undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">Pacientes</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm pl-11">
          {pagination.total > 0
            ? `${pagination.total.toLocaleString()} paciente${pagination.total !== 1 ? "s" : ""} cadastrado${pagination.total !== 1 ? "s" : ""}`
            : "Gerencie os pacientes em atendimento domiciliar"}
        </p>
      </div>

      {error ? (
        <div className="card p-12 text-center text-danger">{error}</div>
      ) : (
        <PatientsTable
          initialData={data as Parameters<typeof PatientsTable>[0]["initialData"]}
          initialPagination={{ ...pagination, page: currentPage }}
          initialSearch={search}
        />
      )}
    </div>
  );
}
