"use client";

import { useState, useTransition } from "react";
import { createPatientAction, lookupCepAction } from "@/actions/patients";
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

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--color-text-light)]">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────
export default function PatientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  // Controlled fields que precisam de máscara
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [cep, setCep] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");

  // Endereço preenchido por ViaCEP
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    const result = await lookupCepAction(cep);
    setCepLoading(false);
    if (!("error" in result)) {
      setStreet(result.street);
      setNeighborhood(result.neighborhood);
      setCity(result.city);
      setState(result.state);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createPatientAction(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFeedback({ type: "success", message: "Paciente cadastrado com sucesso!" });
        setTimeout(() => router.push("/pacientes"), 1500);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in ${
          feedback.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>
          {feedback.type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* ── Seção 1: Identificação ── */}
      <Section icon={User} title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Nome Completo" required>
              <input name="name" className="input" placeholder="Nome completo do paciente" required />
            </Field>
          </div>
          <Field label="Nome Social">
            <input name="socialName" className="input" placeholder="Nome social (opcional)" />
          </Field>
          <Field label="CPF" hint="Formato: 000.000.000-00">
            <input
              name="cpf"
              className="input"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="RG">
            <input name="rg" className="input" placeholder="Número do RG" />
          </Field>
          <Field label="Data de Nascimento">
            <input name="birthDate" type="date" className="input" />
          </Field>
          <Field label="Sexo Biológico">
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
          <Field label="Telefone Principal" hint="(00) 00000-0000 ou (00) 0000-0000">
            <input
              name="phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Telefone Secundário">
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
            <Field label="E-mail">
              <input name="email" type="email" className="input" placeholder="email@exemplo.com" />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 3: Endereço ── */}
      <Section icon={MapPin} title="Endereço">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="CEP" hint="00.000-000">
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
            <Field label="Logradouro">
              <input name="street" className="input" placeholder="Rua, Av., etc." value={street} onChange={(e) => setStreet(e.target.value)} />
            </Field>
          </div>
          <Field label="Número">
            <input name="number" className="input" placeholder="Nº" />
          </Field>
          <Field label="Complemento">
            <input name="complement" className="input" placeholder="Apto, Bloco..." />
          </Field>
          <Field label="Bairro">
            <input name="neighborhood" className="input" placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Cidade">
              <input name="city" className="input" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
          <Field label="UF">
            <input name="state" className="input uppercase" placeholder="SP" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} />
          </Field>
        </div>
      </Section>

      {/* ── Seção 4: Dados Clínicos ── */}
      <Section icon={Heart} title="Dados Clínicos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Status" required>
            <select name="status" className="input">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="alta">Alta</option>
              <option value="suspeso">Suspenso</option>
              <option value="obito">Óbito</option>
            </select>
          </Field>
          <Field label="Tipo Sanguíneo">
            <select name="bloodType" className="input">
              <option value="">Não informado</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Peso (kg)">
            <input name="weight" className="input" placeholder="Ex: 72,5" inputMode="decimal" />
          </Field>
          <Field label="Altura (cm)">
            <input name="height" className="input" placeholder="Ex: 168" inputMode="numeric" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Diagnóstico Principal">
              <textarea name="primaryDiagnosis" className="input min-h-[80px] resize-y" placeholder="CID-10 e descrição do diagnóstico principal..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Diagnósticos Secundários">
              <textarea name="secondaryDiagnoses" className="input min-h-[60px] resize-y" placeholder="Comorbidades e outros diagnósticos..." />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Alergias">
              <textarea name="allergies" className="input min-h-[60px] resize-y" placeholder="Medicamentos, alimentos ou substâncias que causam reação alérgica..." />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Seção 5: Plano de Saúde ── */}
      <Section icon={Shield} title="Plano de Saúde">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Operadora do Plano">
            <input name="healthPlan" className="input" placeholder="Ex: Unimed, Bradesco Saúde..." />
          </Field>
          <Field label="Número da Carteirinha">
            <input name="healthPlanNumber" className="input" placeholder="Número do beneficiário" />
          </Field>
        </div>
      </Section>

      {/* ── Seção 6: Internação ── */}
      <Section icon={Calendar} title="Internação Domiciliar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Data de Admissão">
            <input name="admissionDate" type="date" className="input" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observações Gerais">
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
            <Field label="Nome do Responsável">
              <input name="contact.name" className="input" placeholder="Nome completo" />
            </Field>
          </div>
          <Field label="Grau de Parentesco">
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
          <Field label="Telefone do Responsável" hint="(00) 00000-0000">
            <input
              name="contact.phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={contactPhone}
              onChange={(e) => setContactPhone(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Telefone Alternativo">
            <input
              name="contact.phone2"
              className="input"
              placeholder="(00) 00000-0000"
              value={contactPhone2}
              onChange={(e) => setContactPhone2(maskPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="E-mail do Responsável">
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
