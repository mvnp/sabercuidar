"use server";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { empresas } from "@/db/schema";
import { count } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export async function getEmpresas(page: number = 1, pageSize: number = 25) {
  try {
    const offset = (page - 1) * pageSize;

    // Buscamos os dados paginados
    const data = await db
      .select()
      .from(empresas)
      .limit(pageSize)
      .offset(offset);

    // Buscamos o total aproximado ou real (cuidado com performance em tabelas gigantes)
    // Para simplificar e seguir a regra de "consumir com cuidado", podemos limitar o total mostrado.
    // Mas vamos tentar o count(*) real primeiro, se demorar muito em prod o ideal é usar estatísticas do PG.
    const totalResult = await db.select({ value: count() }).from(empresas);
    const total = totalResult[0].value;

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching empresas:", error);
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
      error: "Falha ao carregar empresas.",
    };
  }
}
