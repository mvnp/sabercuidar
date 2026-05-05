"use server";

import { db } from "@/db";
import { visits } from "@/db/schema";
import { createVisitSchema, updateVisitSchema, type CreateVisitInput, type UpdateVisitInput } from "@/lib/validations";
import { eq, desc, count, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getVisits(params?: {
  patientId?: string;
  professionalId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    if (params?.patientId) conditions.push(eq(visits.patientId, params.patientId));
    if (params?.professionalId) conditions.push(eq(visits.professionalId, params.professionalId));
    if (params?.status) conditions.push(eq(visits.status, params.status as typeof visits.status._.data));
    if (params?.dateFrom) conditions.push(gte(visits.scheduledAt, new Date(params.dateFrom)));
    if (params?.dateTo) conditions.push(lte(visits.scheduledAt, new Date(params.dateTo)));

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(visits)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(visits.scheduledAt))
        .limit(limit).offset(offset),
      db.select({ total: count() }).from(visits),
    ]);

    return { success: true as const, data: rows, meta: { total: Number(total), page, limit } };
  } catch (err) {
    console.error("[getVisits]", err);
    return { success: false as const, error: "Erro ao buscar visitas." };
  }
}

export async function createVisit(input: CreateVisitInput): Promise<ActionResult<typeof visits.$inferSelect>> {
  const parsed = createVisitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const [created] = await db.insert(visits).values({
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt),
    }).returning();

    revalidatePath("/dashboard/visitas");
    return { success: true, data: created };
  } catch (err) {
    console.error("[createVisit]", err);
    return { success: false, error: "Erro ao criar visita." };
  }
}

export async function updateVisit(id: string, input: UpdateVisitInput): Promise<ActionResult<typeof visits.$inferSelect>> {
  const parsed = updateVisitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const [updated] = await db.update(visits)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(visits.id, id))
      .returning();

    if (!updated) return { success: false, error: "Visita não encontrada." };
    revalidatePath("/dashboard/visitas");
    return { success: true, data: updated };
  } catch (err) {
    console.error("[updateVisit]", err);
    return { success: false, error: "Erro ao atualizar visita." };
  }
}
