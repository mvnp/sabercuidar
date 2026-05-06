import { getPatientById } from "@/actions/patients";
import { notFound } from "next/navigation";
import PatientEditForm from "@/components/modules/pacientes/PatientEditForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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

      {/* Formulário */}
      <div className="content-area">
        <PatientEditForm patient={patient} />
      </div>
    </div>
  );
}
