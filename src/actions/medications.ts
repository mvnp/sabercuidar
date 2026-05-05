"use server";

import { db } from "@/db";
import { medications, prescriptions, medicationAdministrations } from "@/db/schema";
import { createMedicationSchema, createPrescriptionSchema } from "@/lib/validations";
import { eq, ilike, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Medicamentos ───────────────────────────────────────────────

export async function getMedications(search?: string) {
  try {
    const rows = await db.select().from(medications)
      .where(search ? ilike(medications.name, `%${search}%`) : undefined)
      .orderBy(medications.name)
      .limit(100);
    return { success: true as const, data: rows };
  } catch (err) {
    console.error("[getMedications]", err);
    return { success: false as const, error: "Erro ao buscar medicamentos." };
  }
}

export async function createMedication(input: unknown): Promise<ActionResult<typeof medications.$inferSelect>> {
  const parsed = createMedicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const [created] = await db.insert(medications).values(parsed.data).returning();
    return { success: true, data: created };
  } catch (err) {
    console.error("[createMedication]", err);
    return { success: false, error: "Erro ao cadastrar medicamento." };
  }
}

// ─── Prescrições ────────────────────────────────────────────────

export async function getPrescriptionsByPatient(patientId: string) {
  try {
    const rows = await db.select().from(prescriptions)
      .where(and(eq(prescriptions.patientId, patientId), eq(prescriptions.status, "ativa")))
      .orderBy(desc(prescriptions.createdAt));
    return { success: true as const, data: rows };
  } catch (err) {
    console.error("[getPrescriptionsByPatient]", err);
    return { success: false as const, error: "Erro ao buscar prescrições." };
  }
}

export async function createPrescription(input: unknown): Promise<ActionResult<typeof prescriptions.$inferSelect>> {
  const parsed = createPrescriptionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const [created] = await db.insert(prescriptions).values({
      ...parsed.data,
      startDate: parsed.data.startDate,
    }).returning();

    revalidatePath("/dashboard/pacientes");
    return { success: true, data: created };
  } catch (err) {
    console.error("[createPrescription]", err);
    return { success: false, error: "Erro ao criar prescrição." };
  }
}

// ─── Registros de administração ─────────────────────────────────

export async function registerAdministration(input: {
  prescriptionId: string;
  patientId: string;
  administeredBy: string;
  scheduledAt: string;
  administeredAt?: string;
  skipped?: boolean;
  skipReason?: string;
  notes?: string;
}): Promise<ActionResult<typeof medicationAdministrations.$inferSelect>> {
  try {
    const [created] = await db.insert(medicationAdministrations).values({
      ...input,
      scheduledAt: new Date(input.scheduledAt),
      administeredAt: input.administeredAt ? new Date(input.administeredAt) : undefined,
    }).returning();

    revalidatePath("/dashboard/medicamentos");
    return { success: true, data: created };
  } catch (err) {
    console.error("[registerAdministration]", err);
    return { success: false, error: "Erro ao registrar administração." };
  }
}

export async function getAdministrationsByPatient(patientId: string, params?: { limit?: number }) {
  try {
    const rows = await db.select().from(medicationAdministrations)
      .where(eq(medicationAdministrations.patientId, patientId))
      .orderBy(desc(medicationAdministrations.scheduledAt))
      .limit(params?.limit ?? 50);
    return { success: true as const, data: rows };
  } catch (err) {
    console.error("[getAdministrationsByPatient]", err);
    return { success: false as const, error: "Erro ao buscar administrações." };
  }
}
