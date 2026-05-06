"use server";

import { db } from "@/db";
import { userAiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAiSettingsAction() {
  const session = await getAuthSession();
  if (!session) return { error: "Não autorizado." };

  const [settings] = await db
    .select()
    .from(userAiSettings)
    .where(eq(userAiSettings.userId, session.user.id))
    .limit(1);

  return { data: settings ?? null };
}

export async function saveAiSettingsAction(formData: FormData) {
  const session = await getAuthSession();
  if (!session) return { error: "Não autorizado." };

  const openAiToken = (formData.get("openAiToken") as string)?.trim() || null;
  const openAiModel = (formData.get("openAiModel") as string)?.trim() || "gpt-4o-mini";

  const [existing] = await db
    .select({ id: userAiSettings.id })
    .from(userAiSettings)
    .where(eq(userAiSettings.userId, session.user.id))
    .limit(1);

  if (existing) {
    await db
      .update(userAiSettings)
      .set({ openAiToken, openAiModel, updatedAt: new Date() })
      .where(eq(userAiSettings.userId, session.user.id));
  } else {
    await db.insert(userAiSettings).values({
      userId: session.user.id,
      openAiToken,
      openAiModel,
    });
  }

  revalidatePath("/configuracoes");
  return { success: true };
}
