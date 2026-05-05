# Mapeamento da Tabela public.empresas

Esta tabela contém dados de empresas (Receita Federal) e é utilizada para consulta e validação no sistema SaberCuidar.

| Coluna | Tipo de Dados | Nulável | Descrição |
| :--- | :--- | :--- | :--- |
| `cnpj_basico` | `text` | NÃO | Os primeiros 8 dígitos do CNPJ. |
| `razao_social` | `text` | NÃO | Nome empresarial da pessoa jurídica. |
| `natureza_juridica` | `text` | NÃO | Código da natureza jurídica. |
| `qualificacao_responsavel` | `text` | NÃO | Qualificação da pessoa física responsável pela empresa. |
| `capital_social` | `text` | NÃO | Capital social da empresa. |
| `porte_empresa` | `text` | NÃO | Código do porte da empresa. |
| `ente_federativo` | `text` | NÃO | Ente federativo responsável (para órgãos públicos). |

## Observações
- A tabela reside no schema `public`.
- Possui centenas de milhares de registros, portanto, consultas devem ser paginadas e otimizadas.
