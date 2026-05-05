import { type ClassValue, clsx } from "clsx";

/** Concatena classes CSS condicionalmente */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Formata CPF: 12345678901 → 123.456.789-01 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/** Formata telefone: 11999999999 → (11) 99999-9999 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

/** Formata CEP: 01310100 → 01310-100 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/** Calcula idade a partir da data de nascimento */
export function calcAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Formata data para exibição: 2024-01-15 → 15/01/2024 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

/** Formata data e hora: → 15/01/2024 às 14:30 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Trunca texto com reticências */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Retorna iniciais do nome: "Ana Paula Silva" → "AP" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

/** Retorna cor de badge pelo status do paciente */
export function patientStatusBadge(status: string): string {
  const map: Record<string, string> = {
    ativo: "badge-success",
    inativo: "badge-neutral",
    alta: "badge-info",
    obito: "badge-danger",
    suspeso: "badge-warning",
  };
  return map[status] ?? "badge-neutral";
}

/** Retorna cor de badge pelo status da visita */
export function visitStatusBadge(status: string): string {
  const map: Record<string, string> = {
    agendada: "badge-info",
    em_andamento: "badge-brand",
    concluida: "badge-success",
    cancelada: "badge-danger",
    nao_realizada: "badge-warning",
  };
  return map[status] ?? "badge-neutral";
}

/** Retorna label legível do status do paciente */
export function patientStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ativo: "Ativo",
    inativo: "Inativo",
    alta: "Alta",
    obito: "Óbito",
    suspeso: "Suspenso",
  };
  return map[status] ?? status;
}

/** Retorna label legível do status da visita */
export function visitStatusLabel(status: string): string {
  const map: Record<string, string> = {
    agendada: "Agendada",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
    nao_realizada: "Não realizada",
  };
  return map[status] ?? status;
}

/** Retorna label legível do tipo de profissional */
export function professionalTypeLabel(type: string): string {
  const map: Record<string, string> = {
    medico: "Médico(a)",
    enfermeiro: "Enfermeiro(a)",
    fisioterapeuta: "Fisioterapeuta",
    tecnico_enfermagem: "Técnico de Enfermagem",
    fonoaudiologo: "Fonoaudiólogo(a)",
    nutricionista: "Nutricionista",
    psicologo: "Psicólogo(a)",
    assistente_social: "Assistente Social",
    cuidador: "Cuidador(a)",
    outro: "Outro",
  };
  return map[type] ?? type;
}

/** Valida CPF */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(digits[10]);
}
