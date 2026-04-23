# Phase 31: Medição, Observabilidade e Iteração - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 31-medicao-observabilidade-e-iteracao
**Areas discussed:** Lighthouse CI, Dashboard RUM, memlab/react-scan, Relatório before/after

---

## Lighthouse CI e gates de build

| Option | Description | Selected |
|--------|-------------|----------|
| Criar GitHub Actions workflow | Adicionar `.github/workflows/lighthouse.yml` que roda em PRs e falha se thresholds excedidos | |
| Script npm local padronizado | `pnpm lighthouse` roda lhci com thresholds. Padroniza execução local. | ✓ |
| Relatório manual periódico | Rodar Lighthouse via DevTools/CLI sem automação | |
| Você decide | O executor escolhe a abordagem mais pragmática | |

**User's choice:** Script npm local padronizado
**Notes:** Projeto não tem CI ativo na raiz. Foco em padronização local com script npm.

**Follow-up — Páginas a testar:**

| Option | Description | Selected |
|--------|-------------|----------|
| Rotas críticas do vault | `/inicio`, `/pacientes`, `/agenda`, `/financeiro` | |
| Todas as rotas principais | Incluir também `/configuracoes`, `/perfil`, `/despesas`, `/backup` | ✓ |
| Apenas landing + login | Focar em páginas públicas | |
| Você decide | O executor define o conjunto mínimo viável | |

**User's choice:** Todas as rotas principais

---

## Dashboard RUM e visualização de métricas

| Option | Description | Selected |
|--------|-------------|----------|
| Página interna /admin/performance | Dashboard web com agregações (p75 por página, tendência diária) | ✓ |
| Script CLI `pnpm rum:report` | Relatório em terminal ou Markdown gerado por script Node | |
| Ambos — página + CLI | Dashboard web + script CLI | |
| Você decide | O executor escolhe a abordagem mais pragmática | |

**User's choice:** Página interna /admin/performance

**Follow-up — Quem acessa:**

| Option | Description | Selected |
|--------|-------------|----------|
| Qualquer usuário logado | Mostrar link no menu para todos | |
| Apenas workspace owner / admin | Restringir via role check | |
| Apenas desenvolvedores (via flag) | Só exibir se env var/feature flag estiver ativa | ✓ |
| Você decide | O executor define a política de acesso | |

**User's choice:** Apenas desenvolvedores (via flag)

**Follow-up — Conteúdo e retenção:**

| Option | Description | Selected |
|--------|-------------|----------|
| Percentil 75 + tendência (7 dias) | p75 por página, gráfico 7 dias, retenção 30 dias | ✓ |
| Métricas brutas + agregação completa | Tabela individual, filtros, p50/p75/p95, retenção 90 dias | |
| Snapshot atual apenas | Últimas 24h, retenção 7 dias | |
| Você decide | O executor define o nível de detalhe | |

**User's choice:** Percentil 75 + tendência (7 dias)

---

## Memory leak detection (memlab) e react-scan

| Option | Description | Selected |
|--------|-------------|----------|
| Script npm para memlab + hook dev para react-scan | Ambos automatizados | ✓ |
| Apenas documentar ambos no CLAUDE.md | Instruções de uso manual | |
| Script npm para memlab + documentar react-scan | Automatizar memlab, documentar react-scan | |
| Você decide | O executor define o nível de automação | |

**User's choice:** Script npm para memlab + hook dev para react-scan

**Follow-up — Cenário memlab:**

| Option | Description | Selected |
|--------|-------------|----------|
| Fluxo principal: pacientes → atendimentos → prontuário | Uso mais comum | ✓ |
| Fluxo completo: login → início → pacientes → agenda → financeiro → configurações | Cobertura total do vault | |
| Fluxo pesado: financeiro com filtros e paginação | Foco na página mais pesada | |
| Você decide | O executor define o cenário mais representativo | |

**User's choice:** Fluxo principal: pacientes → atendimentos → prontuário

---

## Relatório before/after e iteração

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown no repo + script gerador | `pnpm performance:report` gera MD automaticamente | ✓ |
| Markdown manual no repo | Documento escrito pelo dev | |
| Página interna no app | Relatório web gerado dinamicamente | |
| Você decide | O executor define o formato | |

**User's choice:** Markdown no repo + script gerador

**Follow-up — Escopo do relatório:**

| Option | Description | Selected |
|--------|-------------|----------|
| Milestone v1.4 inteiro (fases 27–31) | Comparar métricas antes/depois do v1.4 | |
| Apenas fase 31 (observabilidade) | Focar no impacto das ferramentas de medição | ✓ |
| Comparativo v1.3 → v1.4 completo | Mostrar ganhos desde o início do trabalho de performance | |
| Você decide | O executor define o escopo | |

**User's choice:** Apenas fase 31 (observabilidade)

---

## the agent's Discretion

- O executor pode decidir a biblioteca/componente de chart para o dashboard.
- O executor pode decidir a estratégia exata de cleanup de métricas antigas.
- O executor pode decidir se o relatório inclui também comparação v1.3 → v1.4.
- O executor pode ajustar o cenário memlab se instável.

## Deferred Ideas

- CI gate automático com GitHub Actions
- Serviço externo de RUM (Vercel Speed Insights, Datadog, etc.)
- Dark mode para o dashboard
- Notificações de alerta quando thresholds são excedidos
