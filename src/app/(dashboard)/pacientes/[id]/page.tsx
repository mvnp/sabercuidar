import { getPatientById } from "@/actions/patients";
import PatientDetails from "@/components/modules/pacientes/PatientDetails";
import { notFound } from "next/navigation";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PatientPageProps) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (!result || "error" in result) {
    return { title: "Paciente não encontrado | SaberCuidar" };
  }

  const patient = result.data;
  return {
    title: `${patient.socialName || patient.name} | Detalhes do Paciente`,
    description: `Ficha médica completa de ${patient.name}`,
  };
}

export default async function PacienteDetailPage({ params }: PatientPageProps) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (!result || "error" in result) {
    notFound();
  }

  const patient = result.data;

  return (
    <div className="w-full">
      <PatientDetails patient={patient} />
    </div>
  );
}
