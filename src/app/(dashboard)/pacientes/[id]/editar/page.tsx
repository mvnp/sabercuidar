import { getPatientById } from "@/actions/patients";
import { notFound } from "next/navigation";
import PatientEditForm from "@/components/modules/pacientes/PatientEditForm";
import Link from "next/link";
import { ChevronLeft, Eye } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientEditPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (!result || "error" in result || !result.data) {
    notFound();
  }

  const patient = result.data;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs / Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link 
            href="/pacientes" 
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] transition-colors w-fit"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para listagem
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
            Editar Ficha: <span className="text-[var(--color-brand-600)]">{patient.socialName || patient.name}</span>
          </h1>
        </div>

        <Link 
          href={`/pacientes/${id}`}
          className="btn btn-primary h-10 px-4"
        >
          <Eye className="w-4 h-4" />
          Ver Ficha
        </Link>
      </div>

      {/* Formulário */}
      <div className="content-area">
        <PatientEditForm patient={patient} />
      </div>
    </div>
  );
}
