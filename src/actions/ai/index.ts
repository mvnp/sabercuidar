"use server";

import { db } from "@/db";
import { patientAiEvaluations, userAiSettings, patients, patientContacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RATE_LIMIT = 3;
const WINDOW_HOURS = 24;

// ─────────────────────────────────────────────
//  AVALIAR PACIENTE COM IA
// ─────────────────────────────────────────────
export async function evaluatePatientAction(patientId: string) {
  const session = await getAuthSession();
  if (!session) return { error: "Não autorizado." };

  // 1. Buscar configurações de IA do usuário
  const [aiSettings] = await db
    .select()
    .from(userAiSettings)
    .where(eq(userAiSettings.userId, session.user.id))
    .limit(1);

  if (!aiSettings?.openAiToken) {
    return { error: "Configure seu Token OpenAI em Configurações antes de usar esta função." };
  }

  // 2. Verificar rate limit (3 por paciente por 24h)
  const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
  const allEvals = await db
    .select({ id: patientAiEvaluations.id, createdAt: patientAiEvaluations.createdAt })
    .from(patientAiEvaluations)
    .where(eq(patientAiEvaluations.patientId, patientId))
    .orderBy(desc(patientAiEvaluations.createdAt));

  const countIn24h = allEvals.filter(e => new Date(e.createdAt) >= windowStart).length;

  if (countIn24h >= RATE_LIMIT) {
    const oldestInWindow = allEvals
      .filter(e => new Date(e.createdAt) >= windowStart)
      .at(-1);
    const next = new Date(oldestInWindow!.createdAt);
    next.setHours(next.getHours() + WINDOW_HOURS);
    return {
      error: `Limite de ${RATE_LIMIT} avaliações por 24h atingido. Disponível após ${next.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
    };
  }

  // 3. Buscar dados completos do paciente
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  if (!patient) return { error: "Paciente não encontrado." };

  const contacts = await db
    .select()
    .from(patientContacts)
    .where(eq(patientContacts.patientId, patientId));

  const patientJson = {
    dadosPessoais: {
      nome: patient.name,
      nomeSocial: patient.socialName,
      cpf: patient.cpf,
      dataNascimento: patient.birthDate,
      sexo: patient.gender,
      tipoSanguineo: patient.bloodType,
    },
    dadosClinicosVitais: {
      pesoKg: patient.weight,
      alturaCm: patient.height,
      diagnosticoPrincipal: patient.primaryDiagnosis,
      diagnosticosSecundarios: patient.secondaryDiagnoses,
      alergias: patient.allergies,
    },
    internacaoDomiciliar: {
      status: patient.status,
      dataAdmissao: patient.admissionDate,
      planoSaude: patient.healthPlan,
      observacoes: patient.notes,
    },
    contatosResponsaveis: contacts.map(c => ({
      nome: c.name,
      parentesco: c.relation,
      telefone: c.phone,
    })),
  };

  const prompt = `Você é um assistente médico especializado em home care e cuidados domiciliares. Analise a ficha clínica abaixo e forneça uma avaliação objetiva da saúde geral deste paciente, incluindo:

1. **Pontos críticos de atenção** com base nos diagnósticos informados
2. **Riscos identificados** (alergias, condições crônicas, etc.)
3. **Recomendações gerais** para a equipe de saúde domiciliar
4. **Índice de complexidade do caso:** Baixo / Médio / Alto (com justificativa)

Seja claro, técnico e direto. Responda em português brasileiro.

FICHA DO PACIENTE:
${JSON.stringify(patientJson, null, 2)}`;

  // 4. Chamar OpenAI
  let aiResponse: string;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiSettings.openAiToken}`,
      },
      body: JSON.stringify({
        model: aiSettings.openAiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
      return { error: `Erro na OpenAI: ${err.error?.message ?? `HTTP ${res.status}`}` };
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    aiResponse = data.choices[0]?.message?.content ?? "Sem resposta.";
  } catch {
    return { error: "Falha ao conectar com a OpenAI. Verifique o token e tente novamente." };
  }

  // 5. Salvar laudo no banco
  await db.insert(patientAiEvaluations).values({
    patientId,
    requestedBy: session.user.id,
    model: aiSettings.openAiModel,
    response: aiResponse,
  });

  revalidatePath("/pacientes");
  return { success: true, response: aiResponse };
}

// ─────────────────────────────────────────────
//  BUSCAR LAUDOS DE UM PACIENTE
// ─────────────────────────────────────────────
export async function getPatientEvaluationsAction(patientId: string) {
  const session = await getAuthSession();
  if (!session) return { error: "Não autorizado.", data: [] };

  const evals = await db
    .select()
    .from(patientAiEvaluations)
    .where(eq(patientAiEvaluations.patientId, patientId))
    .orderBy(desc(patientAiEvaluations.createdAt))
    .limit(50);

  return { data: evals };
}

// ─────────────────────────────────────────────
//  RATE LIMIT STATUS
// ─────────────────────────────────────────────
export async function getPatientRateLimitAction(patientId: string) {
  const session = await getAuthSession();
  if (!session) return { used: 0, remaining: RATE_LIMIT, limit: RATE_LIMIT };

  const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);
  const evals = await db
    .select({ createdAt: patientAiEvaluations.createdAt })
    .from(patientAiEvaluations)
    .where(eq(patientAiEvaluations.patientId, patientId))
    .orderBy(desc(patientAiEvaluations.createdAt));

  const used = evals.filter(e => new Date(e.createdAt) >= windowStart).length;
  return { used, remaining: Math.max(0, RATE_LIMIT - used), limit: RATE_LIMIT };
}
