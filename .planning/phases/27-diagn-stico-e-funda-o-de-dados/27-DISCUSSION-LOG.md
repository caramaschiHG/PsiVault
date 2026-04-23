# Phase 27: Diagnóstico e Fundação de Dados - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 27-Diagnóstico e Fundação de Dados
**Areas discussed:** CWV Storage, Bundle Analysis, DB Indexes, Query Logging

---

## CWV Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Endpoint interno no app | API route `/api/metrics` + tabela PostgreSQL. Simples, controle total. | ✓ |
| Serviço externo | GA4, Vercel Speed Insights. Mais robusto, mas dependência externa. | |
| Ambos | Interno + externo como backup. Mais trabalho. | |

**User's choice:** Endpoint interno no app
**Notes:** Usuário prefere manter dados no próprio banco para simplicidade e controle. Não quer adicionar dependência externa nesta fase.

---

## Bundle Analysis

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas manual sob demanda | `ANALYZE=true pnpm build` gera HTML localmente. | (parcial) |
| CI gate com thresholds | Falha automática se exceder limites. | (parcial) |
| Ambos — manual agora, CI depois | Manual nesta fase, CI gate na Phase 31. | ✓ |

**User's choice:** Ambos — manual agora, CI gate depois (Phase 31)
**Notes:** Usuário quer baseline primeiro antes de definir thresholds de CI.

---

## DB Indexes

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas os 2 sugeridos | Appointment + SessionCharge. EXPLAIN na Phase 28. | |
| Os 2 sugeridos + EXPLAIN na mesma fase | Adicionar os 2 e rodar EXPLAIN ANALYZE nesta fase para identificar mais. | ✓ |
| Deixar planner decidir | Não decidir agora, deixar para planning. | |

**User's choice:** Os 2 sugeridos + EXPLAIN ANALYZE na mesma fase
**Notes:** Usuário quer ser proativo na identificação de índices adicionais, não esperar a próxima fase.

---

## Query Logging

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas em desenvolvimento | Middleware Prisma >500ms apenas em dev. Supabase Observability para prod. | ✓ |
| Também em produção com amostragem | 10% das queries em prod. Risco de overhead. | |
| Apenas Supabase Observability | Sem middleware Prisma nem em dev. | |

**User's choice:** Apenas em desenvolvimento
**Notes:** Usuário quer evitar overhead em produção. Confia no `pg_stat_statements` do Supabase para monitoramento de prod.

---

## the agent's Discretion

- Schema exato da tabela `PerformanceMetric`
- Estratégia de amostragem/throttling do endpoint `/api/metrics`
- Quais queries adicionais rodar EXPLAIN ANALYZE

## Deferred Ideas

- CI gate de bundle size com thresholds automáticos → Phase 31
- Serviço externo de RUM → v1.5+
- React Compiler → v1.5+
- Deep memory leak investigation → apenas se dados de campo indicarem
