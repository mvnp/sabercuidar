"use server";

import { db } from "@/db";
import { patients, patientContacts, users } from "@/db/schema";
import { count, eq, ilike, or, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// =============================================================
//  VALIDAÇÃO ZOD
// =============================================================

// Remove tudo que não for dígito (para salvar apenas números no banco)
const onlyDigits = (val: string) => val.replace(/\D/g, "");

const patientContactSchema = z.object({
  name: z.string().min(3, "Nome do contato é obrigatório"),
  relation: z.enum([
    "conjuge", "filho", "filha", "mae", "pai", "irmao", "irma",
    "neto", "neta", "sobrinho", "sobrinha", "amigo", "vizinho", "cuidador", "outro",
  ]),
  phone: z.string().min(1, "Telefone do contato é obrigatório").transform(onlyDigits),
  phone2: z.string().optional().transform((v) => v ? onlyDigits(v) : undefined),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

const createPatientSchema = z.object({
  // Seção 1 — Identificação
  name: z.string().min(3, "Nome completo é obrigatório"),
  socialName: z.string().optional(),
  cpf: z.string().optional().transform((v) => v ? onlyDigits(v) : undefined),
  rg: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informado"]).default("nao_informado"),

  // Seção 2 — Contato do paciente
  phone: z.string().optional().transform((v) => v ? onlyDigits(v) : undefined),
  phone2: z.string().optional().transform((v) => v ? onlyDigits(v) : undefined),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório para criação da conta"),

  // Seção 3 — Endereço
  zipCode: z.string().optional().transform((v) => v ? onlyDigits(v) : undefined),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),

  // Seção 4 — Dados clínicos
  status: z.enum(["ativo", "inativo", "alta", "obito", "suspeso"]).default("ativo"),
  primaryDiagnosis: z.string().optional(),
  secondaryDiagnoses: z.string().optional(),
  allergies: z.string().optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""]).optional(),
  weight: z.string().optional().transform((v) => v ? parseFloat(v.replace(",", ".")) : undefined),
  height: z.string().optional().transform((v) => v ? parseInt(v) : undefined),

  // Seção 5 — Plano de saúde
  healthPlan: z.string().optional(),
  healthPlanNumber: z.string().optional(),

  // Seção 6 — Internação
  admissionDate: z.string().optional(),
  notes: z.string().optional(),

  // Contato principal (responsável)
  contact: patientContactSchema.optional(),
});

// =============================================================
//  LISTAGEM DE PACIENTES
// =============================================================

export async function getPatients(page: number = 1, pageSize: number = 20, search?: string) {
  try {
    const session = await getAuthSession();
    if (!session) return { data: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, error: "Não autorizado." };

    const offset = (page - 1) * pageSize;

    const whereClause = search
      ? or(
          ilike(patients.name, `%${search}%`),
          ilike(patients.cpf, `%${search}%`),
          ilike(patients.city, `%${search}%`),
        )
      : undefined;

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: patients.id,
          name: patients.name,
          socialName: patients.socialName,
          cpf: patients.cpf,
          birthDate: patients.birthDate,
          gender: patients.gender,
          phone: patients.phone,
          status: patients.status,
          city: patients.city,
          state: patients.state,
          admissionDate: patients.admissionDate,
          createdAt: patients.createdAt,
        })
        .from(patients)
        .where(whereClause)
        .orderBy(desc(patients.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ value: count() }).from(patients).where(whereClause),
    ]);

    const total = Number(totalResult[0].value);

    return {
      data,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
      error: "Falha ao carregar pacientes.",
    };
  }
}

// =============================================================
//  CRIAÇÃO DE PACIENTE
// =============================================================

export type CreatePatientResult = 
  | { success: true; id: string; userEmail: string; temporaryPassword: string; error?: never; fieldErrors?: never }
  | { success: false; error: string; fieldErrors?: Record<string, string[]>; id?: never; userEmail?: never; temporaryPassword?: never };

export async function createPatientAction(formData: FormData): Promise<CreatePatientResult> {
  try {
    const session = await getAuthSession();
    if (!session) return { success: false, error: "Não autorizado." };

    const raw = Object.fromEntries(formData.entries());

    // Montar objeto de contato se existir
    const contactRaw = {
      name: raw["contact.name"],
      relation: raw["contact.relation"],
      phone: raw["contact.phone"],
      phone2: raw["contact.phone2"],
      email: raw["contact.email"],
      isPrimary: true,
      notes: raw["contact.notes"],
    };
    const hasContact = Boolean(contactRaw.name && contactRaw.phone);

    const parsed = createPatientSchema.safeParse({
      ...raw,
      contact: hasContact ? contactRaw : undefined,
    });

    if (!parsed.success) {
      return { 
        success: false,
        error: "Dados inválidos. Verifique o formulário.",
        fieldErrors: parsed.error.flatten().fieldErrors 
      };
    }

    const { contact, ...patientData } = parsed.data;

    // 1. Verificar se o e-mail já existe na tabela users
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, patientData.email))
      .limit(1);

    if (existingUser) {
      return { 
        success: false,
        error: "E-mail já cadastrado no sistema.",
        fieldErrors: { email: ["Este e-mail já está em uso por outro usuário."] }
      };
    }

    // 2. Transação para criar Paciente e Usuário
    const result = await db.transaction(async (tx) => {
      // 2.1 Criar conta de usuário para o paciente
      const randomPassword = crypto.randomBytes(8).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      await tx
        .insert(users)
        .values({
          name: patientData.name,
          email: patientData.email,
          passwordHash,
          role: "patient",
          active: true,
        });

      // 2.2 Inserir paciente
      const [newPatient] = await tx
        .insert(patients)
        .values({
          ...patientData,
          weight: patientData.weight?.toString(),
        })
        .returning({ id: patients.id });

      // 2.3 Inserir contato principal se existir
      if (contact && hasContact && newPatient) {
        await tx.insert(patientContacts).values({
          patientId: newPatient.id,
          name: contact.name,
          relation: contact.relation,
          phone: contact.phone,
          phone2: contact.phone2 || null,
          email: contact.email || null,
          isPrimary: true,
          notes: contact.notes || null,
        });
      }

      return { id: newPatient.id, userEmail: patientData.email, temporaryPassword: randomPassword };
    });

    revalidatePath("/pacientes");
    return { success: true, ...result };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { success: false, error: "Erro ao cadastrar paciente. Tente novamente." };
  }
}

// =============================================================
//  BUSCA DE CEP (ViaCEP)
// =============================================================

export async function lookupCepAction(cep: string) {
  try {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return { error: "CEP inválido." };

    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return { error: "Falha ao consultar CEP." };

    const data = await res.json();
    if (data.erro) return { error: "CEP não encontrado." };

    return {
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return { error: "Erro ao consultar CEP." };
  }
}

// =============================================================
//  BUSCAR PACIENTE POR ID
// =============================================================

export async function getPatientById(id: string) {
  try {
    const session = await getAuthSession();
    if (!session) return { error: "Não autorizado." };

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!patient) return { error: "Paciente não encontrado." };
    return { data: patient };
  } catch (err) {
    console.error("[getPatientById]", err);
    return { error: "Erro ao buscar paciente." };
  }
}

// =============================================================
//  ATUALIZAR STATUS DO PACIENTE
// =============================================================

export async function updatePatientStatus(
  id: string,
  status: "ativo" | "inativo" | "alta" | "obito" | "suspeso"
) {
  try {
    const session = await getAuthSession();
    if (!session) return { error: "Não autorizado." };

    await db
      .update(patients)
      .set({ status, updatedAt: new Date() })
      .where(eq(patients.id, id));

    revalidatePath("/pacientes");
    return { success: true };
  } catch (err) {
    console.error("[updatePatientStatus]", err);
    return { error: "Erro ao atualizar status." };
  }
}

// =============================================================
//  VERIFICAR DISPONIBILIDADE DE E-MAIL
// =============================================================

export async function checkEmailUniquenessAction(email: string) {
  try {
    const session = await getAuthSession();
    if (!session) return { error: "Não autorizado." };

    if (!email || !email.includes("@")) return { available: true };

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return { available: !existingUser };
  } catch (error) {
    console.error("Error checking email uniqueness:", error);
    return { error: "Erro ao verificar e-mail." };
  }
}
