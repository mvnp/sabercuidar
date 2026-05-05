"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { createPatientSchema, type CreatePatientInput } from "@/lib/validations";
import { eq, ilike, or, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Listar pacientes (com busca e paginação) ───────────────────

export async function getPatients(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const offset = (page - 1) * limit;

  try {
    const conditions = [];

    if (params?.search) {
      conditions.push(
        or(
          ilike(patients.name, `%${params.search}%`),
          ilike(patients.cpf, `%${params.search}%`)
        )
      );
    }

    if (params?.status) {
      conditions.push(
        eq(patients.status, params.status as typeof patients.status._.data)
      );
    }

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(patients)
        .where(conditions.length ? or(...conditions) : undefined)
        .orderBy(desc(patients.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(patients),
    ]);

    return {
      success: true as const,
      data: rows,
      meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
    };
  } catch (err) {
    console.error("[getPatients]", err);
    return { success: false as const, error: "Erro ao buscar pacientes." };
  }
}

// ─── Buscar paciente por ID ─────────────────────────────────────

export async function getPatientById(
  id: string
): Promise<ActionResult<typeof patients.$inferSelect>> {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!patient) return { success: false, error: "Paciente não encontrado." };
    return { success: true, data: patient };
  } catch (err) {
    console.error("[getPatientById]", err);
    return { success: false, error: "Erro ao buscar paciente." };
  }
}

// ─── Criar paciente ─────────────────────────────────────────────

export async function createPatient(
  input: CreatePatientInput
): Promise<ActionResult<typeof patients.$inferSelect>> {
  const parsed = createPatientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const [created] = await db
      .insert(patients)
      .values({
        ...parsed.data,
        weight: parsed.data.weight?.toString(),
      })
      .returning();

    revalidatePath("/dashboard/pacientes");
    return { success: true, data: created };
  } catch (err: unknown) {
    console.error("[createPatient]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) return { success: false, error: "CPF já cadastrado." };
    return { success: false, error: "Erro ao cadastrar paciente." };
  }
}

// ─── Atualizar paciente ─────────────────────────────────────────

export async function updatePatient(
  id: string,
  input: Partial<CreatePatientInput>
): Promise<ActionResult<typeof patients.$inferSelect>> {
  try {
    const { weight, ...rest } = input;
    const updateData: Partial<typeof patients.$inferInsert> = { 
      ...rest, 
      updatedAt: new Date() 
    };
    
    if (weight !== undefined) {
      updateData.weight = weight?.toString();
    }

    const [updated] = await db
      .update(patients)
      .set(updateData)
      .where(eq(patients.id, id))
      .returning();

    if (!updated) return { success: false, error: "Paciente não encontrado." };
    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/pacientes/${id}`);
    return { success: true, data: updated };
  } catch (err) {
    console.error("[updatePatient]", err);
    return { success: false, error: "Erro ao atualizar paciente." };
  }
}

// ─── Atualizar status do paciente ──────────────────────────────

export async function updatePatientStatus(
  id: string,
  status: "ativo" | "inativo" | "alta" | "obito" | "suspeso"
): Promise<ActionResult> {
  try {
    await db
      .update(patients)
      .set({ status, updatedAt: new Date() })
      .where(eq(patients.id, id));

    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/pacientes/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[updatePatientStatus]", err);
    return { success: false, error: "Erro ao atualizar status." };
  }
}
