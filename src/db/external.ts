import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const empresas = pgTable("empresas", {
  cnpjBasico: text("cnpj_basico").primaryKey(),
  razaoSocial: text("razao_social").notNull(),
  naturezaJuridica: text("natureza_juridica").notNull(),
  qualificacaoResponsavel: text("qualificacao_responsavel").notNull(),
  capitalSocial: text("capital_social").notNull(),
  porteEmpresa: text("porte_empresa").notNull(),
  enteFederativo: text("ente_federativo").notNull(),
});

export const estabelecimentos = pgTable("estabelecimentos", {
  cnpjBasico: text("cnpj_basico").notNull(),
  cnpjOrdem: text("cnpj_ordem").notNull(),
  cnpjDv: text("cnpj_dv").notNull(),
  matrizFilial: text("matriz_filial").notNull(),
  nomeFantasia: text("nome_fantasia"),
  situacaoCadastral: text("situacao_cadastral").notNull(),
  dataSituacaoCadastral: text("data_situacao_cadastral"),
  motivoSituacaoCadastral: text("motivo_situacao_cadastral"),
  cnaePrincipal: text("cnae_principal").notNull(),
  municipio: text("municipio").notNull(),
  uf: text("uf").notNull(),
});

export const municipios = pgTable("municipios", {
  codigo: integer("codigo").primaryKey(),
  descricao: text("descricao").notNull(),
});

export const cnaes = pgTable("cnaes", {
  codigo: integer("codigo").primaryKey(),
  descricao: text("descricao").notNull(),
});
