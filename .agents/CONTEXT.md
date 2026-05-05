# SaberCuidar — Contexto para Agentes de IA

> ⚠️ **LEITURA OBRIGATÓRIA**: Este arquivo deve ser lido **antes de qualquer ação** neste repositório.
> O arquivo principal é `CONTEXT.md` na raiz do projeto. Leia-o também.

---

## Resumo Executivo para IA

Você está trabalhando no **SaberCuidar**, um sistema de gerenciamento para **Home Care** (cuidados domiciliares de saúde).

### O que o sistema faz:
- Gerencia a **ficha médica** de pacientes atendidos em domicílio
- Registra e controla **visitas domiciliares**
- Gerencia **administração de medicamentos** (prescrições, horários, registros)
- Mantém cadastro de **profissionais de saúde** (médicos, enfermeiros, fisioterapeutas)
- Integra com a **Receita Federal** para validação de CPF/CNPJ
- (Futuro) Usa **IA** para análise clínica e suporte à decisão

### Usuária principal:
Profissional de saúde, 40 anos, 20 anos de experiência em Home Care.
O sistema deve ser **simples, confiável e acolhedor**.

---

## Stack — Respeite Estritamente

```
Next.js 15 (App Router) + TypeScript
Tailwind CSS v4
PostgreSQL + Drizzle ORM
Server Actions (backend)
Zod (validações)
```

---

## Regras Absolutas

| Regra | Motivo |
|-------|--------|
| ❌ Nunca SQL manual | Sempre Drizzle ORM + migrations |
| ❌ Nunca `any` em TypeScript | Strict mode ativo |
| ❌ Nunca hardcode de variáveis sensíveis | Usar `.env` |
| ✅ Sempre validar com Zod nas Server Actions | Segurança e DX |
| ✅ Sempre Server Components por padrão | Performance |
| ✅ Usar `"use client"` apenas quando necessário | Minimizar bundle |

---

## Schema do Banco (Tabelas Principais)

Veja o arquivo completo em `src/db/schema.ts`.

Tabelas existentes:
- `users` — Usuários do sistema
- `patients` — Fichas dos pacientes
- `professionals` — Profissionais de saúde
- `visits` — Visitas domiciliares
- `medications` — Medicamentos cadastrados
- `prescriptions` — Prescrições médicas
- `medication_administrations` — Registro de administração
- `patient_professionals` — Relação paciente ↔ profissional

---

## Workflows Disponíveis

Veja `workflows/` neste diretório para fluxos específicos.

---

## Identidade Visual

- **Cor principal**: teal (`#0d9488`)
- **Fundo**: teal-50 (`#f0fdfa`)
- **Tipografia**: Inter
- **Tom**: Acolhedor, profissional, claro

---

## Como Contribuir como IA

1. **Leia** `CONTEXT.md` (raiz) e este arquivo
2. **Entenda** o módulo que vai modificar
3. **Siga** os padrões de código existentes
4. **Documente** decisões relevantes no CONTEXT.md
5. **Nunca** quebre migrations existentes — crie novas

---

*Este arquivo é mantido automaticamente. Última atualização: Maio 2026*
