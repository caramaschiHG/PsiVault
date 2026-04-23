# Phase 31: Medição, Observabilidade e Iteração - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Dar ao time visibilidade contínua de performance e um relatório validado de melhorias do que foi feito nas fases 27–30. Esta fase instala ferramentas de observabilidade, cria interfaces de visualização, e consolida o entregável final do milestone v1.4 Performance Profunda.

**Requirements mapeados:** OBS-01, OBS-02, OBS-03, OBS-04, OBS-05

**Success criteria:**
1. Lighthouse CI falha builds que excedem thresholds de CWV (LCP < 2.5s, CLS < 0.1)
2. Dashboard RUM mostra percentil 75 de LCP, INP, CLS para usuários reais
3. memlab não detecta memory leaks no fluxo de navegação de pacientes
4. react-scan destaca re-renders desnecessários durante desenvolvimento
5. Relatório publicado mostra métricas before/after com próximos passos acionáveis

</domain>

<decisions>
## Implementation Decisions

### Lighthouse CI e Gates de Build
- **D-01:** Script npm local padronizado: `pnpm lighthouse` roda Lighthouse CI com thresholds definidos em config JSON.
- **D-02:** Não criar GitHub Actions workflow — projeto não tem CI ativo na raiz. Foco em padronização local.
- **D-03:** Thresholds: LCP < 2.5s, CLS < 0.1 (conforme success criteria). INP e TTFB também monitorados como advisory.
- **D-04:** Páginas testadas: todas as rotas principais do vault — `/inicio`, `/pacientes`, `/agenda`, `/financeiro`, `/configuracoes`, `/perfil`, `/despesas`, `/backup`.
- **D-05:** Modo headless via CLI. Relatório em HTML + JSON armazenado em `.planning/performance/`.

### Dashboard RUM
- **D-06:** Página interna `/admin/performance` com dashboard de métricas CWV.
- **D-07:** Acesso restrito a desenvolvedores via feature flag (ex: env var `ENABLE_PERF_DASHBOARD=1`). Não visível para usuários em produção.
- **D-08:** Conteúdo: percentil 75 (p75) de LCP, INP, CLS por página, com tendência dos últimos 7 dias.
- **D-09:** Retenção de dados: 30 dias. Implementar cleanup automático (script ou cron) que remove métricas antigas da tabela `PerformanceMetric`.
- **D-10:** Queries agregadas diretamente no PostgreSQL (percentile_cont ou aproximação via Prisma) — sem dependências externas.

### Memory Leak Detection (memlab) e react-scan
- **D-11:** Script npm `pnpm memlab` roda cenário de navegação automatizado e gera relatório em terminal/JSON.
- **D-12:** Cenário memlab: fluxo principal do app — pacientes → atendimentos → prontuário. Cobre as 3 áreas principais de uso.
- **D-13:** react-scan integrado como hook de desenvolvimento: componente `<ReactScan />` montado condicionalmente quando `NODE_ENV === 'development'`.
- **D-14:** react-scan NÃO deve afetar builds de produção — garantir que o import seja dinâmico ou condicional para não poluir o bundle prod.

### Relatório Before/After
- **D-15:** Formato: Markdown no repo + script gerador (`pnpm performance:report`).
- **D-16:** Arquivo de saída: `.planning/milestones/v1.4-PERFORMANCE-REPORT.md`.
- **D-17:** Escopo do relatório: foco na fase 31 (observabilidade) — documentar infraestrutura instalada, thresholds definidos, e próximos passos acionáveis. Não é um relatório de ganhos de performance do v1.4.
- **D-18:** Script lê métricas do banco (RUM), resultados do Lighthouse, e memlab para compor o relatório automaticamente.

### the agent's Discretion
- O executor pode decidir a biblioteca/componente de chart para o dashboard (se usar algum) — mas preferir solução sem lib externa (tabelas + CSS) para não aumentar bundle.
- O executor pode decidir a estratégia exata de cleanup de métricas antigas (Prisma deleteMany agendado, trigger de banco, ou script npm).
- O executor pode decidir se o relatório inclui também comparação v1.3 → v1.4 se dados históricos estiverem facilmente disponíveis.
- O executor pode ajustar o cenário memlab se o fluxo pacientes → atendimentos → prontuário for instável em ambiente de teste.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Performance Infrastructure (fases anteriores)
- `.planning/phases/27-diagn-stico-e-funda-o-de-dados/27-CONTEXT.md` — Decisões sobre CWV collector, bundle analyzer, query logging, column selection
- `.planning/phases/28-streaming-suspense/28-CONTEXT.md` — Decisões sobre streaming, skeletons, AsyncBoundary
- `.planning/phases/29-cache-seletivo/29-CONTEXT.md` — Decisões sobre unstable_cache, revalidateTag, revalidatePath scope
- `.planning/phases/30-otimiza-o-de-assets-e-bundle/30-CONTEXT.md` — Decisões sobre lazy loading, next/dynamic, optimizePackageImports

### Requirements
- `.planning/REQUIREMENTS.md` — OBS-01 a OBS-05 com critérios de aceitação
- `.planning/PROJECT.md` — Constraints de stack, regras de testes (407 testes), sensibilidade de dados

### Código existente
- `src/components/cwv-collector.tsx` — CWV collector com batching e sendBeacon
- `src/app/api/metrics/route.ts` — Endpoint que recebe métricas e grava em PerformanceMetric
- `prisma/schema.prisma` — Model `PerformanceMetric` (linha 438)
- `next.config.ts` — Configuração atual do Next.js
- `package.json` — Dependências atuais (sem memlab, sem react-scan)

### Stack e patterns
- `src/lib/db.ts` — PrismaClient singleton
- `src/app/globals.css` — Design tokens, motion tokens
- `CLAUDE.md` — Regras de tom, vocabulário, anti-padrões visuais

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/cwv-collector.tsx` — Pattern de coleta de métricas com batching. Pode ser referenciado para documentar como os dados são coletados.
- `src/app/api/metrics/route.ts` — Pattern de endpoint de métricas. Pode ser estendido com queries agregadas para o dashboard.
- `src/lib/metrics/store.ts` e `src/lib/metrics/repository.prisma.ts` — Repository pattern para PerformanceMetric (verificar se existe).

### Established Patterns
- **Feature flag via env var**: O projeto não usa feature flag library — env vars são o padrão para toggles dev-only.
- **Repository pattern**: Toda query ao banco passa por repository. O dashboard deve seguir este padrão.
- **Workspace-scoped queries**: Mesmo métricas anônimas (workspaceId null) devem ser filtradas corretamente no dashboard.
- **Server Components**: Páginas admin/performance devem ser Server Components com dados fetch no servidor.
- **CSS tokens**: Dashboard deve usar tokens existentes (`--duration-*`, `--ease-*`, cores, espaçamento).

### Integration Points
- `src/app/(vault)/layout.tsx` — CwvCollector é montado aqui. react-scan também seria montado aqui (condicionalmente).
- `src/app/(vault)/` — Novas rotas admin devem ficar em `(vault)/admin/performance` ou similar.
- `package.json` — Adicionar `lighthouse`, `lhci`, `memlab`, `react-scan` como devDependencies.
- `.planning/milestones/` — Diretório onde o relatório será gerado.

</code_context>

<specifics>
## Specific Ideas

- O relatório deve ser gerado como Markdown versionado no repo — não como página web ou PDF.
- O dashboard /admin/performance é uma página interna de ferramenta, não uma feature de produto. Pode ter aparência "utilitária" — tabelas bem formatadas, sem necessidade de charts elaborados.
- memlab requer um ambiente com Chromium/Puppeteer. O cenário deve apontar para `http://localhost:3000` (ambiente de dev).
- react-scan pode ser importado dinamicamente para garantir que não entre no bundle de produção: `await import('react-scan')` dentro de um useEffect em dev.

</specifics>

<deferred>
## Deferred Ideas

- CI gate automático com GitHub Actions — requer criação de workflow completo; projeto não tem CI ativo hoje.
- Serviço externo de RUM (Vercel Speed Insights, Datadog, etc.) — decisão de Phase 27 foi manter tudo no próprio banco.
- Dark mode para o dashboard — dark mode não está no roadmap.
- Notificações de alerta quando thresholds são excedidos — complexidade adicional, fora do escopo.

</deferred>

---

*Phase: 31-medi-o-observabilidade-e-itera-o*
*Context gathered: 2026-04-23*
