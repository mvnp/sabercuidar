import PatientForm from "@/components/modules/pacientes/PatientForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Novo Paciente | SaberCuidar",
  description: "Cadastro de novo paciente para atendimento domiciliar",
};

export default function NovoPacientePage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand-700)] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">Novo Paciente</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Preencha as informações abaixo para cadastrar um novo paciente no sistema.
          Campos marcados com <span className="text-red-400">*</span> são obrigatórios.
        </p>
      </div>

      <PatientForm />
    </div>
  );
}
