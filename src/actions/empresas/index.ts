"use server";

import { db } from "@/db";
import { savedSearches } from "@/db/schema";
import { empresas, estabelecimentos, municipios as municipiosTable, cnaes } from "@/db/external";
import { count, sql, eq, inArray, and, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

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

export async function getEmpresasAvancado(filters: { 
  cnaes?: string; 
  municipios?: string; 
  page?: number; 
  pageSize?: number;
  onlyWithFantasyName?: boolean;
}) {
  try {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const offset = (page - 1) * pageSize;

    const query = db
      .selectDistinct({
        cnpjBasico: empresas.cnpjBasico,
        razaoSocial: empresas.razaoSocial,
        naturezaJuridica: empresas.naturezaJuridica,
        qualificacaoResponsavel: empresas.qualificacaoResponsavel,
        capitalSocial: empresas.capitalSocial,
        porteEmpresa: empresas.porteEmpresa,
        enteFederativo: empresas.enteFederativo,
      })
      .from(estabelecimentos)
      .innerJoin(empresas, eq(estabelecimentos.cnpjBasico, empresas.cnpjBasico));

    const conditions = [];

    // Situação Cadastral Ativa (02)
    conditions.push(sql`${estabelecimentos.situacaoCadastral}::int = 2`);

    if (filters.onlyWithFantasyName) {
      conditions.push(
        and(
          sql`${estabelecimentos.nomeFantasia} IS NOT NULL`,
          sql`${estabelecimentos.nomeFantasia} != ''`,
          sql`TRIM(${estabelecimentos.nomeFantasia}) != ''`
        )
      );
    }

    if (filters.cnaes) {
      const cnaeList = filters.cnaes.split(",").map(c => c.trim()).filter(Boolean);
      if (cnaeList.length > 0) {
        conditions.push(inArray(estabelecimentos.cnaePrincipal, cnaeList));
      }
    }

    if (filters.municipios) {
      const munList = filters.municipios.split(",").map(m => m.trim()).filter(Boolean);
      if (munList.length > 0) {
        conditions.push(inArray(estabelecimentos.municipio, munList));
      }
    }

    const whereClause = and(...conditions);

    // Buscamos os dados
    const data = await query
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);

    // Count filtrado
    const totalResult = await db
      .select({ value: count() })
      .from(estabelecimentos)
      .where(whereClause);
      
    const total = Number(totalResult[0].value);

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
    console.error("Error in advanced search:", error);
    return {
      data: [],
      pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
      error: "Erro ao realizar busca avançada.",
    };
  }
}

export async function getMunicipios(search?: string) {
  try {
    const query = db.select().from(municipiosTable);
    if (search) {
      query.where(sql`LOWER(${municipiosTable.descricao}) LIKE LOWER(${'%' + search.toLowerCase() + '%'})`);
    }
    return await query.limit(10);
  } catch (error) {
    console.error("Error fetching municipios:", error);
    return [];
  }
}

export async function getCnaes(search?: string) {
  try {
    const query = db.select().from(cnaes);
    if (search) {
      query.where(sql`LOWER(${cnaes.descricao}) LIKE LOWER(${'%' + search.toLowerCase() + '%'}) OR ${cnaes.codigo}::text LIKE ${'%' + search + '%'} `);
    }
    return await query.limit(10);
  } catch (error) {
    console.error("Error fetching cnaes:", error);
    return [];
  }
}

export async function saveSearchAction(name: string, filters: { cnaes?: string; municipios?: string }) {
  try {
    const session = await getAuthSession();
    if (!session) return { error: "Não autorizado." };

    await db.insert(savedSearches).values({
      userId: session.user.id,
      name,
      filters: JSON.stringify(filters),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving search:", error);
    return { error: "Erro ao salvar busca." };
  }
}

export async function getSavedSearchesAction() {
  try {
    const session = await getAuthSession();
    if (!session) return [];

    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, session.user.id))
      .orderBy(desc(savedSearches.createdAt));
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return [];
  }
}

export async function deleteSavedSearchAction(id: string) {
  try {
    const session = await getAuthSession();
    if (!session) return { error: "Não autorizado." };

    await db.delete(savedSearches).where(and(
      eq(savedSearches.id, id),
      eq(savedSearches.userId, session.user.id)
    ));

    return { success: true };
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return { error: "Erro ao deletar busca." };
  }
}
