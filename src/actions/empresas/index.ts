"use server";

import { db } from "@/db";
import { empresas } from "@/db/schema";
import { count, sql } from "drizzle-orm";

export async function getEmpresas(page: number = 1, pageSize: number = 25) {
  try {
    const offset = (page - 1) * pageSize;

    // Buscamos os dados paginados
    const data = await db
      .select()
      .from(empresas)
      .limit(pageSize)
      .offset(offset);

    // Otimização: Em tabelas com centenas de milhares de registros, count(*) é lento.
    // Vamos usar a estimativa do sistema (pg_class) para ser instantâneo.
    const estimateResult = await db.execute(sql`
      SELECT reltuples::bigint AS estimate 
      FROM pg_class 
      WHERE relname = 'empresas'
    `);
    
    // Fallback para count se a estimativa falhar ou for 0 (tabela pequena)
    const estimate = (estimateResult[0] as { estimate: string | number | null })?.estimate;
    let total = Number(estimate || 0);
    
    if (total === 0) {
      const totalResult = await db.select({ value: count() }).from(empresas);
      total = Number(totalResult[0].value);
    }

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
