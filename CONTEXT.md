# SaberCuidar — Contexto do Projeto

## Visão Geral

**SaberCuidar** é um sistema de **Gerenciamento para Home Care** desenvolvido em Next.js 15 com PostgreSQL.

O sistema é voltado para profissionais de saúde que atuam com cuidados domiciliares, com foco em:
- Ficha médica completa dos pacientes
- Registro e gestão de visitas domiciliares
- Administração e controle medicamentoso
- Parcerias com médicos, enfermeiros e outros profissionais da saúde
- Integração com dados da Receita Federal (validação de CPF/CNPJ)
- Inteligência Artificial para análise e apoio a decisões clínicas

---

## Perfil da Usuária Principal

Mulher, 40 anos, com **20 anos de experiência** em cuidados de saúde domiciliar:
- Atendimento a pacientes novos e idosos
- Cuidados paliativos e pacientes terminais
- Rotina do cotidiano (médico da família)
- Assistência domiciliar completa

O sistema deve ser **intuitivo, acessível e confiável**, com visual limpo e linguagem próxima da área da saúde.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 |
| Backend | Server Actions (Next.js) |
| Banco de dados | PostgreSQL via Drizzle ORM |
| Migrations | Drizzle Kit (`npm run db:generate` → `npm run db:migrate`) |
| Inteligência Artificial | OpenAI GPT-4o (futuro) |
| Deploy | EasyPanel via Docker |
| Controle de versão | Git |

> ⚠️ **REGRA ABSOLUTA**: NUNCA executar SQL manualmente no banco.
> Toda alteração de schema deve ser feita via Drizzle ORM e migrations geradas automaticamente.

---

## Estrutura de Diretórios

```
sabercuidar/
├── .agents/                  # Instruções e workflows para IA
│   ├── CONTEXT.md            # Este arquivo (leitura obrigatória pela IA)
│   └── workflows/            # Fluxos específicos por módulo
├── src/
│   ├── app/                  # App Router (páginas, layouts, Server Actions)
│   │   ├── (auth)/           # Grupo: autenticação
│   │   ├── (dashboard)/      # Grupo: sistema principal
│   │   ├── layout.tsx        # Layout raiz
│   │   ├── page.tsx          # Página inicial (login/landing)
│   │   └── globals.css       # Estilos globais + tokens de design
│   ├── db/
│   │   ├── index.ts          # Conexão com PostgreSQL (Drizzle)
│   │   ├── schema.ts         # Schema completo do banco
│   │   └── migrations/       # Migrations geradas pelo Drizzle Kit
│   ├── actions/              # Server Actions organizadas por domínio
│   │   ├── patients.ts
│   │   ├── visits.ts
│   │   ├── medications.ts
│   │   └── professionals.ts
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/               # Componentes base (Button, Input, Card...)
│   │   └── modules/          # Componentes de domínio
│   ├── lib/                  # Utilitários, helpers, validações
│   │   ├── utils.ts
│   │   └── validations.ts
│   └── types/                # Tipos TypeScript globais
│       └── index.ts
├── public/                   # Assets estáticos
├── .agents/                  # IA: instruções e contexto
├── .env                      # Variáveis locais (não commitar)
├── .env.example              # Template de variáveis
├── .gitignore
├── .dockerignore
├── Dockerfile
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Módulos do Sistema

### 1. Pacientes (Ficha Médica)
- Cadastro completo: dados pessoais, contatos, responsáveis
- Histórico clínico, alergias, condições crônicas
- Documentos (CPF validado via Receita Federal)
- Fotos e documentos anexados

### 2. Visitas Domiciliares
- Agendamento e registro de visitas
- Check-in/check-out com geolocalização
- Relatórios de evolução clínica
- Assinatura digital do paciente/responsável

### 3. Administração Medicamentosa
- Prescrições médicas digitais
- Horários e alertas de medicação
- Registro de administração (quem, quando, dose)
- Histórico de medicações

### 4. Profissionais e Parcerias
- Cadastro de médicos, enfermeiros, fisioterapeutas, etc.
- Vinculação de profissionais a pacientes
- Agenda compartilhada
- Especialidades e CRM/COREN

### 5. Receita Federal (Integração)
- Consulta de CNPJ de empresas na tabela `public.empresas`
- Mapeamento de colunas disponível em `src/db/empresas_schema.md`
- Paginação de alta performance para tabelas com grande volume de dados

### 6. Inteligência Artificial (Futuro)
- Análise de prontuários e sugestões clínicas
- Alertas de interações medicamentosas
- Previsão de riscos para pacientes paliativos
- Resumo automático de visitas

---

## Identidade Visual

**Paleta de cores (Home Care)**:
- Verde-teal principal: `#0d9488` (teal-600)
- Verde-teal claro: `#5eead4` (teal-300)
- Verde-teal escuro: `#0f766e` (teal-700)
- Fundo: `#f0fdfa` (teal-50)
- Texto: `#134e4a` (teal-900)
- Acento calmante: `#e0f2fe` (sky-100)
- Alerta/urgência: `#ef4444` (red-500)
- Sucesso: `#22c55e` (green-500)

**Tipografia**: Inter (Google Fonts)

**Tom**: Profissional, acolhedor, claro. Nunca frio ou técnico demais.

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Banco de dados
npm run db:generate    # Gerar migration após alterar schema.ts
npm run db:migrate     # Aplicar migrations pendentes
npm run db:studio      # Abrir Drizzle Studio (GUI do banco)
npm run db:push        # Push direto (apenas dev, sem migration)

# Build e deploy
npm run build
npm run start
```

---

## Regras para Desenvolvimento

1. **Server Actions** são o único backend — sem route handlers REST, a não ser para webhooks externos
2. **Drizzle ORM** para 100% das queries — sem SQL puro/manual
3. **Zod** para validação de formulários e dados das Server Actions
4. **TypeScript strict** — sem `any` explícito
5. **Componentes Server-first** — use `"use client"` apenas quando necessário (interatividade, hooks)
6. **Migrations versionadas** — cada mudança de schema gera e commita uma migration
7. **Variáveis de ambiente** sempre via `.env` — nunca hardcoded
8. **Padrão de Formulários**:
   - Todo formulário deve ter máscaras para: CEP, Telefone, WhatsApp, CPF e CNPJ.
   - A validação deve exibir avisos (hints) logo abaixo de cada input em caso de erro, melhorando a legibilidade.
   - Campos numéricos não devem aceitar letras (bloqueio via frontend).
   - Para campos monetários, deve sempre ser aplicado real brasileiro com R$ no frontend porém sempre enviar para o backend no formato de número. Ex: R$ 10,000.00 -> 10000.00

---

## Instruções para Inteligência Artificial

> **LEIA ESTE ARQUIVO ANTES DE QUALQUER AÇÃO.**

Ao ser acionada neste projeto, a IA deve:
1. Ler este arquivo (`CONTEXT.md` ou `.agents/CONTEXT.md`) completamente
2. Entender o domínio: Home Care, cuidados domiciliares, saúde
3. Respeitar a stack tecnológica definida
4. Nunca criar SQL manual — sempre usar Drizzle ORM
5. Manter a identidade visual teal/verde-saúde
6. Validar dados com Zod nas Server Actions
7. Documentar qualquer decisão arquitetural relevante aqui

---

*Última atualização: Maio 2026*
