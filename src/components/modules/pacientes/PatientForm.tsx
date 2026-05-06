"use client";

import { useState, useTransition } from "react";
import { createPatientAction, lookupCepAction, checkEmailUniquenessAction } from "@/actions/patients";
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
//  Seção decorativa
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  Seção decorativa
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
export default function PatientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ 
    type: "error" | "success"; 
    message: string;
    data?: { userEmail: string; temporaryPassword: string };
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Controlled fields que precisam de máscara ou validação em tempo real
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");

  // Endereço preenchido por ViaCEP
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Helpers para campos numéricos
  const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
  };

  const handleDecimalInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Permite números e uma única vírgula ou ponto
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

  async function handleEmailBlur() {
    if (!email || !email.includes("@") || email.length < 5) return;
    
    setEmailLoading(true);
    const result = await checkEmailUniquenessAction(email);
    setEmailLoading(false);

    if (result && "available" in result && !result.available) {
      setFieldErrors(prev => ({
        ...prev,
        email: ["Este e-mail já está em uso por outro usuário."]
      }));
    } else if (result && "available" in result && result.available) {
      // Limpa o erro de e-mail se estiver disponível
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createPatientAction(formData);
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFeedback({ 
          type: "success", 
          message: "Paciente cadastrado com sucesso!",
          data: { 
            userEmail: result.userEmail, 
            temporaryPassword: result.temporaryPassword 
          }
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (feedback?.type === "success" && feedback.data) {
    return (
      <div className="card p-8 text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-brand-900)]">Cadastro Realizado!</h2>
          <p className="text-[var(--color-text-muted)] mt-2">
            O paciente foi cadastrado e uma conta de acesso foi criada automaticamente.
          </p>
        </div>

        <div className="bg-[var(--color-brand-50)] p-6 rounded-xl border border-[var(--color-brand-100)] text-left space-y-4">
          <p className="text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wider">Credenciais de Acesso</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-text-light)] uppercase font-semibold">E-mail</p>
              <p className="font-medium text-[var(--color-brand-900)]">{feedback.data.userEmail}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-light)] uppercase font-semibold">Senha Temporária</p>
              <p className="font-mono font-bold text-[var(--color-brand-600)] bg-white px-2 py-1 rounded border border-[var(--color-brand-200)] inline-block">
                {feedback.data.temporaryPassword}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] italic">
            * Informe estas credenciais ao paciente. Ele deverá alterar a senha no primeiro acesso.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            onClick={() => router.push("/pacientes")}
            className="btn btn-secondary flex-1"
          >
            Ir para Listagem
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary flex-1"
          >
            Cadastrar Outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Feedback de Erro Geral */}
      {feedback?.type === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in bg-red-50 border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {feedback.message}
        </div>
      )}

      {/* ── Seção 1: Identificação ── */}
      <Section icon={User} title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Nome Completo" required error={fieldErrors.name}>
              <input name="name" className="input" placeholder="Nome completo do paciente" required />
            </Field>
          </div>
          <Field label="Nome Social" error={fieldErrors.socialName}>
            <input name="socialName" className="input" placeholder="Nome social (opcional)" />
          </Field>
          <Field label="CPF" hint="Formato: 000.000.000-00" error={fieldErrors.cpf}>
            <input
              name="cpf"
              className="input"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="RG" error={fieldErrors.rg}>
            <input name="rg" className="input" placeholder="Número do RG" />
          </Field>
          <Field label="Data de Nascimento" error={fieldErrors.birthDate}>
            <input name="birthDate" type="date" className="input" />
          </Field>
          <Field label="Sexo Biológico" error={fieldErrors.gender}>
            <select name="gender" className="input">
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
              hint="Este e-mail será usado para o login do paciente." 
              error={fieldErrors.email}
            >
              <div className="relative">
                <input 
                  name="email" 
                  type="email" 
                  className="input pr-9" 
                  placeholder="email@exemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                />
                {emailLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-500)] animate-spin" />
                )}
              </div>
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
              onInput={handleNumericInput}
            />
          </Field>
          <Field label="Complemento" error={fieldErrors.complement}>
            <input name="complement" className="input" placeholder="Apto, Bloco..." />
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
            <select name="status" className="input">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="alta">Alta</option>
              <option value="suspeso">Suspenso</option>
              <option value="obito">Óbito</option>
            </select>
          </Field>
          <Field label="Tipo Sanguíneo" error={fieldErrors.bloodType}>
            <select name="bloodType" className="input">
              <option value="">Não informado</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Peso (kg)" error={fieldErrors.weight}>
            <input 
              name="weight" 
              className="input" 
              placeholder="Ex: 72.5" 
              onInput={handleDecimalInput}
            />
          </Field>
          <Field label="Altura (cm)" error={fieldErrors.height}>
            <input 
              name="height" 
              className="input" 
              placeholder="Ex: 168" 
              onInput={handleNumericInput}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Diagnóstico Principal" error={fieldErrors.primaryDiagnosis}>
              <textarea name="primaryDiagnosis" className="input min-h-[80px] resize-y" placeholder="CID-10 e descrição do diagnóstico principal..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Diagnósticos Secundários" error={fieldErrors.secondaryDiagnoses}>
              <textarea name="secondaryDiagnoses" className="input min-h-[60px] resize-y" placeholder="Comorbidades e outros diagnósticos..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Alergias" error={fieldErrors.allergies}>
              <textarea name="allergies" className="input min-h-[60px] resize-y" placeholder="Medicamentos, alimentos ou substâncias que causam reação alérgica..." />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 5: Plano de Saúde ── */}
      <Section icon={Shield} title="Plano de Saúde">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Operadora do Plano" error={fieldErrors.healthPlan}>
            <input name="healthPlan" className="input" placeholder="Ex: Unimed, Bradesco Saúde..." />
          </Field>
          <Field label="Número da Carteirinha" error={fieldErrors.healthPlanNumber}>
            <input name="healthPlanNumber" className="input" placeholder="Número do beneficiário" />
          </Field>
        </div>
      </Section>

      {/* ── Seção 6: Internação ── */}
      <Section icon={Calendar} title="Internação Domiciliar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Data de Admissão" error={fieldErrors.admissionDate}>
            <input name="admissionDate" type="date" className="input" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observações Gerais" error={fieldErrors.notes}>
              <textarea name="notes" className="input min-h-[80px] resize-y" placeholder="Informações adicionais relevantes para a equipe..." />
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
              <input name="contact.name" className="input" placeholder="Nome completo" />
            </Field>
          </div>
          <Field label="Grau de Parentesco" error={fieldErrors["contact.relation"]}>
            <select name="contact.relation" className="input">
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
            <input name="contact.email" type="email" className="input" placeholder="email@exemplo.com" />
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
            <><ChevronRight className="w-4 h-4" /> Cadastrar Paciente</>
          )}
        </button>
      </div>
    </form>
  );
}

