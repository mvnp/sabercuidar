"use server";

import { db } from "@/db";
import { professionals } from "@/db/schema";
import { createProfessionalSchema, type CreateProfessionalInput } from "@/lib/validations";
import { eq, ilike, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getProfessionals(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const offset = (page - 1) * limit;

  try {
    const [rows, [{ total }]] = await Promise.all([
      db.select().from(professionals)
        .where(params?.search ? ilike(professionals.name, `%${params.search}%`) : undefined)
        .orderBy(desc(professionals.createdAt))
        .limit(limit).offset(offset),
      db.select({ total: count() }).from(professionals),
    ]);

    return { success: true as const, data: rows, meta: { total: Number(total), page, limit } };
  } catch (err) {
    console.error("[getProfessionals]", err);
    return { success: false as const, error: "Erro ao buscar profissionais." };
  }
}

export async function createProfessional(input: CreateProfessionalInput): Promise<ActionResult<typeof professionals.$inferSelect>> {
  const parsed = createProfessionalSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const [created] = await db.insert(professionals).values(parsed.data).returning();
    revalidatePath("/dashboard/profissionais");
    return { success: true, data: created };
  } catch (err: unknown) {
    console.error("[createProfessional]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) return { success: false, error: "CPF já cadastrado." };
    return { success: false, error: "Erro ao cadastrar profissional." };
  }
}

export async function updateProfessional(id: string, input: Partial<CreateProfessionalInput>): Promise<ActionResult<typeof professionals.$inferSelect>> {
  try {
    const [updated] = await db.update(professionals)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning();

    if (!updated) return { success: false, error: "Profissional não encontrado." };
    revalidatePath("/dashboard/profissionais");
    return { success: true, data: updated };
  } catch (err) {
    console.error("[updateProfessional]", err);
    return { success: false, error: "Erro ao atualizar profissional." };
  }
}
