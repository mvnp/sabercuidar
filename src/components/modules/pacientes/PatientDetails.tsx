"use client";

import { 
  User, Phone, MapPin, Heart, Shield, 
  ArrowLeft, Pencil, Bot, Clock, Hash, Mail, 
  ExternalLink, Stethoscope, AlertTriangle, Info,
} from "lucide-react";
import Link from "next/link";
import { Patient, PatientContact } from "@/db/schema";
import { useState } from "react";
import PatientAiPanel from "./PatientAiPanel";

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

function formatCep(cep: string | null) {
  if (!cep) return "—";
  const d = cep.replace(/\D/g, "");
  return d.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2-$3");
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
  ativo: "badge-success",
  inativo: "badge-neutral",
  alta: "badge-info",
  suspeso: "badge-warning",
  obito: "badge-danger",
};

const statusLabels: Record<string, string> = {
  ativo: "Ativo", inativo: "Inativo", alta: "Alta", suspeso: "Suspenso", obito: "Óbito",
};

const relationLabels: Record<string, string> = {
  conjuge: "Cônjuge", filho: "Filho", filha: "Filha", mae: "Mãe", pai: "Pai",
  irmao: "Irmão", irma: "Irmã", neto: "Neto", neta: "Neta", sobrinho: "Sobrinho",
  sobrinha: "Sobrinha", amigo: "Amigo(a)", vizinho: "Vizinho(a)", cuidador: "Cuidador(a)", outro: "Outro",
};

// ─────────────────────────────────────────────
//  Sub-componentes de UI
// ─────────────────────────────────────────────

function DetailSection({ 
  icon: Icon, 
  title, 
  children, 
  className = "" 
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-0 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-brand-50)]/50">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-bold text-[var(--color-brand-900)] text-sm uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function DetailItem({ 
  label, 
  value, 
  icon: Icon, 
  className = "",
  fullWidth = false
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ElementType;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-full" : ""} ${className}`}>
      <span className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <div className="text-sm font-medium text-[var(--color-brand-900)] break-words min-h-[1.25rem]">
        {value || <span className="text-[var(--color-text-light)] italic font-normal">Não informado</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Componente Principal
// ─────────────────────────────────────────────

interface PatientDetailsProps {
  patient: Patient & { contacts?: PatientContact[] };
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  const [showAiPanel, setShowAiPanel] = useState(false);

  const primaryContact = patient.contacts?.find(c => c.isPrimary) || patient.contacts?.[0];
  const age = calcAge(patient.birthDate);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── Toolbar Superior ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link
            href="/pacientes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-800)] transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para listagem
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-600/20">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-brand-900)] leading-tight">
                {patient.socialName || patient.name}
              </h1>
              {patient.socialName && (
                <p className="text-sm text-[var(--color-text-muted)] font-medium">Nome civil: {patient.name}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`badge ${statusStyles[patient.status] ?? "badge-neutral"}`}>
                  {statusLabels[patient.status] ?? patient.status}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Hash className="w-3 h-3" /> ID: {patient.id.split("-")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiPanel(true)}
            className="btn btn-secondary h-10 px-4 group"
          >
            <Bot className="w-4 h-4 text-[var(--color-brand-600)] group-hover:scale-110 transition-transform" />
            Avaliar com IA
          </button>
          <Link 
            href={`/pacientes/${patient.id}/editar`}
            className="btn btn-primary h-10 px-4"
          >
            <Pencil className="w-4 h-4" />
            Editar Ficha
          </Link>
        </div>
      </div>

      {/* ── Grid de Informações ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Identidade e Clínica */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seção: Identificação */}
          <DetailSection icon={User} title="Identificação">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <DetailItem label="CPF" value={formatCpf(patient.cpf)} />
              <DetailItem label="RG" value={patient.rg} />
              <DetailItem label="Nascimento" value={patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : null} />
              <DetailItem label="Idade" value={age ? `${age} anos` : null} />
              <DetailItem label="Sexo Biológico" value={patient.gender === "nao_informado" ? "Não informado" : patient.gender === "feminino" ? "Feminino" : patient.gender === "masculino" ? "Masculino" : "Outro"} />
              <DetailItem label="Tipo Sanguíneo" value={patient.bloodType} />
            </div>
          </DetailSection>

          {/* Seção: Dados Clínicos */}
          <DetailSection icon={Heart} title="Dados Clínicos">
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
                <DetailItem label="Peso" value={patient.weight ? `${patient.weight} kg` : null} />
                <DetailItem label="Altura" value={patient.height ? `${patient.height} cm` : null} />
                <DetailItem label="IMC" value={patient.weight && patient.height ? (Number(patient.weight) / Math.pow(Number(patient.height)/100, 2)).toFixed(1) : null} />
                <DetailItem label="Admissão" value={patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : null} icon={Clock} />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[var(--color-border)]">
                <DetailItem 
                  label="Diagnóstico Principal" 
                  value={patient.primaryDiagnosis} 
                  icon={Stethoscope}
                  fullWidth 
                  className="bg-[var(--color-brand-50)]/50 p-3 rounded-lg border border-dashed border-[var(--color-brand-200)]"
                />
                <DetailItem 
                  label="Diagnósticos Secundários" 
                  value={patient.secondaryDiagnoses} 
                  fullWidth 
                />
                <DetailItem 
                  label="Alergias Conhecidas" 
                  value={patient.allergies} 
                  icon={AlertTriangle}
                  fullWidth 
                  className={patient.allergies ? "bg-red-50 p-3 rounded-lg border border-dashed border-red-200" : ""}
                />
              </div>
            </div>
          </DetailSection>

          {/* Seção: Observações */}
          <DetailSection icon={Info} title="Observações e Notas">
            <div className="text-sm text-[var(--color-brand-900)] whitespace-pre-wrap">
              {patient.notes || "Nenhuma observação registrada."}
            </div>
          </DetailSection>

        </div>

        {/* Coluna 3: Contato e Endereço */}
        <div className="space-y-6">
          
          {/* Seção: Contatos */}
          <DetailSection icon={Phone} title="Canais de Contato">
            <div className="space-y-6">
              <div className="space-y-4">
                <DetailItem label="E-mail Principal" value={patient.email} icon={Mail} fullWidth />
                <DetailItem label="Telefone Principal" value={formatPhone(patient.phone)} fullWidth />
                <DetailItem label="Telefone Secundário" value={formatPhone(patient.phone2)} fullWidth />
              </div>

              {primaryContact && (
                <div className="pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-[var(--color-brand-700)] uppercase tracking-tighter">Responsável Principal</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--color-brand-100)] text-[var(--color-brand-700)] rounded font-bold uppercase">
                      {relationLabels[primaryContact.relation] || primaryContact.relation}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <DetailItem label="Nome" value={primaryContact.name} fullWidth />
                    <DetailItem label="Telefone" value={formatPhone(primaryContact.phone)} fullWidth />
                    {primaryContact.email && <DetailItem label="E-mail" value={primaryContact.email} fullWidth />}
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Seção: Endereço */}
          <DetailSection icon={MapPin} title="Localização">
            <div className="space-y-4">
              <DetailItem label="CEP" value={formatCep(patient.zipCode)} fullWidth />
              <div className="grid grid-cols-3 gap-2">
                <DetailItem label="Logradouro" value={patient.street} className="col-span-2" />
                <DetailItem label="Número" value={patient.number} />
              </div>
              <DetailItem label="Complemento" value={patient.complement} fullWidth />
              <DetailItem label="Bairro" value={patient.neighborhood} fullWidth />
              <DetailItem label="Cidade / UF" value={patient.city ? `${patient.city} / ${patient.state || ""}` : null} fullWidth />
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${patient.street}, ${patient.number} - ${patient.neighborhood}, ${patient.city} - ${patient.state}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100 hover:bg-sky-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver no Google Maps
              </a>
            </div>
          </DetailSection>

          {/* Seção: Plano de Saúde */}
          <DetailSection icon={Shield} title="Convênio">
            <div className="space-y-4">
              <DetailItem label="Operadora" value={patient.healthPlan} fullWidth />
              <DetailItem label="Carteirinha" value={patient.healthPlanNumber} fullWidth />
            </div>
          </DetailSection>

        </div>

      </div>

      {/* Painel IA */}
      <PatientAiPanel 
        patient={showAiPanel ? patient : null}
        onClose={() => setShowAiPanel(false)}
      />
    </div>
  );
}
