"use client";

import { useState, useTransition } from "react";
import { updatePatientAction, lookupCepAction } from "@/actions/patients";
import { useRouter } from "next/navigation";
import {
  User, Phone, MapPin, Heart, Shield, Calendar,
  ChevronRight, Loader2, Search, AlertCircle, CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────
//  Helpers de máscara
// ─────────────────────────────────────────────
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}
function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4").replace(/-$/, "");
}
function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2-$3").replace(/-$/, "").replace(/\.$/, "");
}

// ─────────────────────────────────────────────
//  Componentes Visuais
// ─────────────────────────────────────────────
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-[var(--color-brand-900)] text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ 
  label, 
  required, 
  children, 
  hint, 
  error 
}: { 
  label: string; 
  required?: boolean; 
  children: React.ReactNode; 
  hint?: string;
  error?: string[] | string;
}) {
  const errorMsg = Array.isArray(error) ? error[0] : error;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {errorMsg ? (
        <p className="text-[11px] text-danger font-medium animate-fade-in flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {errorMsg}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-[var(--color-text-light)]">{hint}</p>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────
interface PatientContact {
  id: string;
  name: string;
  relation: "conjuge" | "filho" | "filha" | "mae" | "pai" | "irmao" | "irma" | "neto" | "neta" | "sobrinho" | "sobrinha" | "amigo" | "vizinho" | "cuidador" | "outro";
  phone: string;
  phone2: string | null;
  email: string | null;
  isPrimary: boolean;
  notes: string | null;
}

interface Patient {
  id: string;
  name: string;
  socialName: string | null;
  cpf: string | null;
  rg: string | null;
  birthDate: string | null;
  gender: "masculino" | "feminino" | "outro" | "nao_informado";
  phone: string | null;
  phone2: string | null;
  email: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  status: "ativo" | "inativo" | "alta" | "obito" | "suspeso";
  primaryDiagnosis: string | null;
  secondaryDiagnoses: string | null;
  allergies: string | null;
  bloodType: string | null;
  weight: string | null;
  height: number | null;
  healthPlan: string | null;
  healthPlanNumber: string | null;
  admissionDate: string | null;
  notes: string | null;
  contacts?: PatientContact[];
}

interface PatientEditFormProps {
  patient: Patient;
}

export default function PatientEditForm({ patient }: PatientEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ 
    type: "error" | "success"; 
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [cepLoading, setCepLoading] = useState(false);

  // Controlled fields
  const [cpf] = useState(patient.cpf ? maskCpf(patient.cpf) : "");
  const [phone, setPhone] = useState(patient.phone ? maskPhone(patient.phone) : "");
  const [phone2, setPhone2] = useState(patient.phone2 ? maskPhone(patient.phone2) : "");
  const [cep, setCep] = useState(patient.zipCode ? maskCep(patient.zipCode) : "");
  const [email] = useState(patient.email || "");

  // Endereço
  const [street, setStreet] = useState(patient.street || "");
  const [neighborhood, setNeighborhood] = useState(patient.neighborhood || "");
  const [city, setCity] = useState(patient.city || "");
  const [state, setState] = useState(patient.state || "");

  // Contato Responsável
  const primaryContact = patient.contacts?.find((c) => c.isPrimary) || ({} as Partial<PatientContact>);
  const [contactPhone, setContactPhone] = useState(primaryContact.phone ? maskPhone(primaryContact.phone) : "");
  const [contactPhone2, setContactPhone2] = useState(primaryContact.phone2 ? maskPhone(primaryContact.phone2) : "");

  // Helpers para campos numéricos
  const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
  };

  const handleDecimalInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9,.]/g, "");
    const parts = e.currentTarget.value.split(/[.,]/);
    if (parts.length > 2) {
      e.currentTarget.value = parts[0] + "," + parts.slice(1).join("");
    }
  };

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    const result = await lookupCepAction(cep);
    setCepLoading(false);
    if (result && !("error" in result)) {
      setStreet(result.street);
      setNeighborhood(result.neighborhood);
      setCity(result.city);
      setState(result.state);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("id", patient.id);

    startTransition(async () => {
      const result = await updatePatientAction(formData);
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFeedback({ 
          type: "success", 
          message: "Paciente atualizado com sucesso!"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          router.push(`/pacientes`);
        }, 1500);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Feedback */}
      {feedback?.type === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in bg-red-50 border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {feedback.message}
        </div>
      )}

      {feedback?.type === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in bg-emerald-50 border-emerald-200 text-emerald-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {feedback.message} Redirecionando...
        </div>
      )}

      {/* ── Seção 1: Identificação ── */}
      <Section icon={User} title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Nome Completo" required error={fieldErrors.name}>
              <input name="name" className="input" placeholder="Nome completo do paciente" defaultValue={patient.name} required />
            </Field>
          </div>
          <Field label="Nome Social" error={fieldErrors.socialName}>
            <input name="socialName" className="input" placeholder="Nome social (opcional)" defaultValue={patient.socialName || ""} />
          </Field>
          <Field label="CPF" hint="CPF não pode ser alterado após o cadastro" error={fieldErrors.cpf}>
            <input
              name="cpf_display"
              className="input opacity-70 bg-gray-50 cursor-not-allowed"
              placeholder="000.000.000-00"
              value={cpf}
              disabled
            />
            <input type="hidden" name="cpf" value={patient.cpf || ""} />
          </Field>
          <Field label="RG" error={fieldErrors.rg}>
            <input name="rg" className="input" placeholder="Número do RG" defaultValue={patient.rg || ""} />
          </Field>
          <Field label="Data de Nascimento" error={fieldErrors.birthDate}>
            <input name="birthDate" type="date" className="input" defaultValue={patient.birthDate || ""} />
          </Field>
          <Field label="Sexo Biológico" error={fieldErrors.gender}>
            <select name="gender" className="input" defaultValue={patient.gender}>
              <option value="nao_informado">Não informado</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Seção 2: Contato ── */}
      <Section icon={Phone} title="Contato do Paciente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Telefone Principal" hint="(00) 00000-0000" error={fieldErrors.phone}>
            <input
              name="phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Telefone Secundário" error={fieldErrors.phone2}>
            <input
              name="phone2"
              className="input"
              placeholder="(00) 00000-0000"
              value={phone2}
              onChange={(e) => setPhone2(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <div className="md:col-span-2">
            <Field 
              label="E-mail / Acesso ao Sistema" 
              required 
              hint="O e-mail de acesso não pode ser alterado." 
              error={fieldErrors.email}
            >
              <input 
                name="email_display" 
                type="email" 
                className="input opacity-70 bg-gray-50 cursor-not-allowed" 
                value={email}
                disabled
              />
              <input type="hidden" name="email" value={patient.email || ""} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 3: Endereço ── */}
      <Section icon={MapPin} title="Endereço">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="CEP" hint="00.000-000" error={fieldErrors.zipCode}>
            <div className="relative">
              <input
                name="zipCode"
                className="input pr-9"
                placeholder="00.000-000"
                value={cep}
                onChange={(e) => setCep(maskCep(e.target.value))}
                onBlur={handleCepBlur}
                inputMode="numeric"
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-500)] animate-spin" />
              )}
              {!cepLoading && (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              )}
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Logradouro" error={fieldErrors.street}>
              <input name="street" className="input" placeholder="Rua, Av., etc." value={street} onChange={(e) => setStreet(e.target.value)} />
            </Field>
          </div>
          <Field label="Número" error={fieldErrors.number}>
            <input 
              name="number" 
              className="input" 
              placeholder="Nº" 
              defaultValue={patient.number || ""}
              onInput={handleNumericInput}
            />
          </Field>
          <Field label="Complemento" error={fieldErrors.complement}>
            <input name="complement" className="input" placeholder="Apto, Bloco..." defaultValue={patient.complement || ""} />
          </Field>
          <Field label="Bairro" error={fieldErrors.neighborhood}>
            <input name="neighborhood" className="input" placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Cidade" error={fieldErrors.city}>
              <input name="city" className="input" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
          <Field label="UF" error={fieldErrors.state}>
            <input name="state" className="input uppercase" placeholder="SP" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} />
          </Field>
        </div>
      </Section>

      {/* ── Seção 4: Dados Clínicos ── */}
      <Section icon={Heart} title="Dados Clínicos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Status" required error={fieldErrors.status}>
            <select name="status" className="input" defaultValue={patient.status}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="alta">Alta</option>
              <option value="suspeso">Suspenso</option>
              <option value="obito">Óbito</option>
            </select>
          </Field>
          <Field label="Tipo Sanguíneo" hint="Não pode ser alterado" error={fieldErrors.bloodType}>
            <select name="bloodType_display" className="input opacity-70 bg-gray-50 cursor-not-allowed" defaultValue={patient.bloodType || ""} disabled>
              <option value="">Não informado</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="hidden" name="bloodType" value={patient.bloodType || ""} />
          </Field>
          <Field label="Peso (kg)" error={fieldErrors.weight}>
            <input 
              name="weight" 
              className="input" 
              placeholder="Ex: 72.5" 
              defaultValue={patient.weight ? patient.weight.replace(".", ",") : ""}
              onInput={handleDecimalInput}
            />
          </Field>
          <Field label="Altura (cm)" error={fieldErrors.height}>
            <input 
              name="height" 
              className="input" 
              placeholder="Ex: 168" 
              defaultValue={patient.height || ""}
              onInput={handleNumericInput}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Diagnóstico Principal" error={fieldErrors.primaryDiagnosis}>
              <textarea name="primaryDiagnosis" className="input min-h-[80px] resize-y" placeholder="CID-10 e descrição do diagnóstico principal..." defaultValue={patient.primaryDiagnosis || ""} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Diagnósticos Secundários" error={fieldErrors.secondaryDiagnoses}>
              <textarea name="secondaryDiagnoses" className="input min-h-[60px] resize-y" placeholder="Comorbidades e outros diagnósticos..." defaultValue={patient.secondaryDiagnoses || ""} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Alergias" error={fieldErrors.allergies}>
              <textarea name="allergies" className="input min-h-[60px] resize-y" placeholder="Medicamentos, alimentos ou substâncias que causam reação alérgica..." defaultValue={patient.allergies || ""} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 5: Plano de Saúde ── */}
      <Section icon={Shield} title="Plano de Saúde">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Operadora do Plano" error={fieldErrors.healthPlan}>
            <input name="healthPlan" className="input" placeholder="Ex: Unimed, Bradesco Saúde..." defaultValue={patient.healthPlan || ""} />
          </Field>
          <Field label="Número da Carteirinha" error={fieldErrors.healthPlanNumber}>
            <input name="healthPlanNumber" className="input" placeholder="Número do beneficiário" defaultValue={patient.healthPlanNumber || ""} />
          </Field>
        </div>
      </Section>

      {/* ── Seção 6: Internação ── */}
      <Section icon={Calendar} title="Internação Domiciliar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Data de Admissão" error={fieldErrors.admissionDate}>
            <input name="admissionDate" type="date" className="input" defaultValue={patient.admissionDate || ""} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observações Gerais" error={fieldErrors.notes}>
              <textarea name="notes" className="input min-h-[80px] resize-y" placeholder="Informações adicionais relevantes para a equipe..." defaultValue={patient.notes || ""} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 7: Contato/Responsável ── */}
      <Section icon={Phone} title="Contato / Responsável Principal">
        <p className="text-sm text-[var(--color-text-muted)] -mt-2">
          Pessoa de referência para emergências e comunicação com a família.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Nome do Responsável" error={fieldErrors["contact.name"]}>
              <input name="contact.name" className="input" placeholder="Nome completo" defaultValue={primaryContact.name || ""} />
            </Field>
          </div>
          <Field label="Grau de Parentesco" error={fieldErrors["contact.relation"]}>
            <select name="contact.relation" className="input" defaultValue={primaryContact.relation || "outro"}>
              <option value="outro">Outro</option>
              <option value="conjuge">Cônjuge</option>
              <option value="filho">Filho</option>
              <option value="filha">Filha</option>
              <option value="mae">Mãe</option>
              <option value="pai">Pai</option>
              <option value="irmao">Irmão</option>
              <option value="irma">Irmã</option>
              <option value="neto">Neto</option>
              <option value="neta">Neta</option>
              <option value="sobrinho">Sobrinho</option>
              <option value="sobrinha">Sobrinha</option>
              <option value="amigo">Amigo(a)</option>
              <option value="vizinho">Vizinho(a)</option>
              <option value="cuidador">Cuidador(a)</option>
            </select>
          </Field>
          <Field label="Telefone do Responsável" hint="(00) 00000-0000" error={fieldErrors["contact.phone"]}>
            <input
              name="contact.phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={contactPhone}
              onChange={(e) => setContactPhone(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Telefone Alternativo" error={fieldErrors["contact.phone2"]}>
            <input
              name="contact.phone2"
              className="input"
              placeholder="(00) 00000-0000"
              value={contactPhone2}
              onChange={(e) => setContactPhone2(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="E-mail do Responsável" error={fieldErrors["contact.email"]}>
            <input name="contact.email" type="email" className="input" placeholder="email@exemplo.com" defaultValue={primaryContact.email || ""} />
          </Field>
        </div>
      </Section>

      {/* ── Botões de ação ── */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
          disabled={isPending}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary min-w-[160px]" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : (
            <><ChevronRight className="w-4 h-4" /> Salvar Alterações</>
          )}
        </button>
      </div>
    </form>
  );
}
