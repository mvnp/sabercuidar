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
  socialName: z.string().optional().transform(v => v || null),
  cpf: z.string().optional().transform((v) => v ? onlyDigits(v) : null),
  rg: z.string().optional().transform(v => v || null),
  birthDate: z.string().optional().transform(v => v || null),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informado"]).default("nao_informado"),

  // Seção 2 — Contato do paciente
  phone: z.string().optional().transform((v) => v ? onlyDigits(v) : null),
  phone2: z.string().optional().transform((v) => v ? onlyDigits(v) : null),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório para criação da conta"),

  // Seção 3 — Endereço
  zipCode: z.string().optional().transform((v) => v ? onlyDigits(v) : null),
  street: z.string().optional().transform(v => v || null),
  number: z.string().optional().transform(v => v || null),
  complement: z.string().optional().transform(v => v || null),
  neighborhood: z.string().optional().transform(v => v || null),
  city: z.string().optional().transform(v => v || null),
  state: z.string().max(2).optional().transform(v => v || null),

  // Seção 4 — Dados clínicos
  status: z.enum(["ativo", "inativo", "alta", "obito", "suspeso"]).default("ativo"),
  primaryDiagnosis: z.string().optional().transform(v => v || null),
  secondaryDiagnoses: z.string().optional().transform(v => v || null),
  allergies: z.string().optional().transform(v => v || null),
  bloodType: z.string().optional().transform(v => v || null),
  weight: z.string().optional().transform((v) => v ? parseFloat(v.replace(",", ".")) : null),
  height: z.string().optional().transform((v) => v ? parseInt(v) : null),

  // Seção 5 — Plano de saúde
  healthPlan: z.string().optional().transform(v => v || null),
  healthPlanNumber: z.string().optional().transform(v => v || null),

  // Seção 6 — Internação
  admissionDate: z.string().optional().transform(v => v || null),
  notes: z.string().optional().transform(v => v || null),

  // Contato principal (responsável)
  contact: patientContactSchema.optional(),
});

const updatePatientSchema = createPatientSchema.extend({
  id: z.string().uuid(),
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
          weight: patientData.weight ? patientData.weight.toString() : null,
        })
        .returning({ id: patients.id });

      // 2.3 Inserir contato principal se existir
      if (contact && hasContact && newPatient) {
        await tx.insert(patientContacts).values({
          patientId: newPatient.id,
          name: contact.name,
          relation: contact.relation as typeof patientContacts.$inferInsert["relation"],
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
    console.error("DETAILED ERROR [createPatientAction]:", error);
    return { success: false, error: "Erro ao cadastrar paciente. Verifique os dados e tente novamente." };
  }
}

export type UpdatePatientResult = 
  | { success: true; error?: never; fieldErrors?: never }
  | { success: false; error: string; fieldErrors?: Record<string, string[]>; };

export async function updatePatientAction(formData: FormData): Promise<UpdatePatientResult> {
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

    const parsed = updatePatientSchema.safeParse({
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

    const { id, contact, ...patientData } = parsed.data;

    // 1. Verificar se o paciente existe
    const [existingPatient] = await db
      .select({ email: patients.email })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!existingPatient) {
      return { success: false, error: "Paciente não encontrado." };
    }

    // 2. Se o e-mail mudou, verificar se o novo e-mail já existe
    if (patientData.email !== existingPatient.email) {
      const [emailUsed] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, patientData.email))
        .limit(1);

      if (emailUsed) {
        return { 
          success: false,
          error: "O novo e-mail já está sendo usado por outro usuário.",
          fieldErrors: { email: ["Este e-mail já está em uso."] }
        };
      }
    }

    // 3. Transação para atualizar
    await db.transaction(async (tx) => {
      // 3.1 Atualizar usuário vinculado (se o e-mail original existir na tabela users)
      if (existingPatient.email) {
        await tx
          .update(users)
          .set({
            name: patientData.name,
            email: patientData.email,
            updatedAt: new Date(),
          })
          .where(eq(users.email, existingPatient.email));
      }

      // 3.2 Atualizar paciente
      await tx
        .update(patients)
        .set({
          ...patientData,
          weight: patientData.weight ? patientData.weight.toString() : null,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, id));

      // 3.3 Atualizar ou inserir contato principal
      if (contact && hasContact) {
        const [existingContact] = await tx
          .select({ id: patientContacts.id })
          .from(patientContacts)
          .where(or(
            eq(patientContacts.patientId, id),
            // eq(patientContacts.isPrimary, true) // Ideally we filter by primary
          ))
          .limit(1);

        if (existingContact) {
          await tx
            .update(patientContacts)
            .set({
              name: contact.name,
              relation: contact.relation as typeof patientContacts.$inferInsert["relation"],
              phone: contact.phone,
              phone2: contact.phone2 || null,
              email: contact.email || null,
              notes: contact.notes || null,
            })
            .where(eq(patientContacts.id, existingContact.id));
        } else {
          await tx.insert(patientContacts).values({
            patientId: id,
            name: contact.name,
            relation: contact.relation as typeof patientContacts.$inferInsert["relation"],
            phone: contact.phone,
            phone2: contact.phone2 || null,
            email: contact.email || null,
            isPrimary: true,
            notes: contact.notes || null,
          });
        }
      }
    });

    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    return { success: true };
  } catch (error) {
    console.error("ERROR [updatePatientAction]:", error);
    return { success: false, error: "Erro ao atualizar paciente." };
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

    const contacts = await db
      .select()
      .from(patientContacts)
      .where(eq(patientContacts.patientId, id));

    return { data: { ...patient, contacts } };
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
