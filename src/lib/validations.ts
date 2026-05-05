import { z } from "zod";

// ─── Schemas de validação Zod ──────────────────────────────────

export const createPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(255),
  socialName: z.string().max(255).optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional()
    .or(z.literal("")),
  rg: z.string().max(30).optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informado"]).default("nao_informado"),
  phone: z.string().max(20).optional(),
  phone2: z.string().max(20).optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  zipCode: z.string().max(9).optional(),
  street: z.string().max(255).optional(),
  number: z.string().max(20).optional(),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2, "UF inválida").optional().or(z.literal("")),
  guardianName: z.string().max(255).optional(),
  guardianPhone: z.string().max(20).optional(),
  guardianRelation: z.string().max(100).optional(),
  primaryDiagnosis: z.string().optional(),
  secondaryDiagnoses: z.string().optional(),
  allergies: z.string().optional(),
  bloodType: z.string().max(5).optional(),
  weight: z.number().positive().optional(),
  height: z.number().int().positive().optional(),
  healthPlan: z.string().max(255).optional(),
  healthPlanNumber: z.string().max(100).optional(),
  admissionDate: z.string().optional(),
  notes: z.string().optional(),
});

export const createProfessionalSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(255),
  type: z.enum([
    "medico", "enfermeiro", "fisioterapeuta", "tecnico_enfermagem",
    "fonoaudiologo", "nutricionista", "psicologo", "assistente_social",
    "cuidador", "outro",
  ]),
  councilNumber: z.string().max(50).optional(),
  councilState: z.string().length(2).optional().or(z.literal("")),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(20).optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const createVisitSchema = z.object({
  patientId: z.string().uuid("Paciente inválido"),
  professionalId: z.string().uuid("Profissional inválido"),
  scheduledAt: z.string().datetime("Data/hora inválida"),
  notes: z.string().optional(),
});

export const updateVisitSchema = z.object({
  status: z.enum(["agendada", "em_andamento", "concluida", "cancelada", "nao_realizada"]).optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  clinicalEvolution: z.string().optional(),
  vitalSigns: z.string().optional(),
  procedures: z.string().optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  prescribedBy: z.string().uuid(),
  medicationId: z.string().uuid(),
  dosage: z.string().min(1, "Dose obrigatória").max(100),
  frequency: z.string().min(1, "Frequência obrigatória").max(100),
  route: z.enum(["oral", "subcutanea", "intravenosa", "intramuscular", "topica", "inalatoria", "retal", "sublingual", "ocular", "outro"]).default("oral"),
  startDate: z.string(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
});

export const createMedicationSchema = z.object({
  name: z.string().min(2).max(255),
  genericName: z.string().max(255).optional(),
  presentation: z.string().max(100).optional(),
  manufacturer: z.string().max(255).optional(),
  anvisaCode: z.string().max(50).optional(),
  notes: z.string().optional(),
});

// ─── Tipos de formulário inferidos ───────────────────────────────

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
