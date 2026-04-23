# Requirements: PsiVault v1.4 Performance Profunda

## Milestone v1.4 Requirements

### Diagnóstico e Fundação (PERF)

- [ ] **PERF-01**: Bundle size baseline estabelecido via `@next/bundle-analyzer` com script de build `ANALYZE=true`
- [ ] **PERF-02**: Core Web Vitals instrumentados via `web-vitals` library com endpoint de coleta RUM
- [ ] **PERF-03**: Índices compostos adicionados em `Appointment` (`[workspaceId, status, startsAt]`) e `SessionCharge` (`[workspaceId, status, createdAt]`)
- [ ] **PERF-04**: Supavisor transaction mode configurado (`DATABASE_URL` com `pgbouncer=true&prepareThreshold=0`, `DIRECT_URL` para migrations)
- [ ] **PERF-05**: Prisma query logging extension (`$extends`) adicionado para identificar queries lentas (threshold >500ms)
- [ ] **PERF-06**: Column selection (`LIST_SELECT` pattern) estendido para endpoints de search de pacientes

### Streaming e Suspense (STREAM)

- [ ] **STREAM-01**: `loading.tsx` adicionado para rotas pesadas (`/financeiro`, `/inicio`)
- [ ] **STREAM-02**: Seções de página decompostas em Server Components assíncronos independentes
- [ ] **STREAM-03**: Suspense boundaries granulares com skeletons que correspondem às dimensões finais (prevenção de CLS)
- [ ] **STREAM-04**: React 19 `use` API utilizado para streaming de promises para Client Components (com Error Boundaries)
- [ ] **STREAM-05**: Streaming visual de charts com Suspense boundaries

### Cache Seletivo e Seguro (CACHE)

- [ ] **CACHE-01**: `unstable_cache` aplicado em métodos de repository leitura-intensiva (`PracticeProfile`, `ExpenseCategory`, workspace metadata)
- [ ] **CACHE-02**: `revalidateTag` implementado em todas as Server Actions de mutação
- [ ] **CACHE-03**: Chaves de cache sempre incluem `workspaceId` (padrão: `['domain', workspaceId, ...params]`)
- [ ] **CACHE-04**: Audit de `revalidatePath` existente confirmando escopo `'page'` em todas as 13 actions

### Otimização de Assets e Bundle (ASSET)

- [ ] **ASSET-01**: `next/dynamic` aplicado em componentes Client pesados (charts, date pickers, editores, PDF preview)
- [ ] **ASSET-02**: `optimizePackageImports` configurado em `next.config.ts` para bibliotecas utilitárias adotadas
- [ ] **ASSET-03**: `next/image` utilizado em todas as imagens da aplicação (zero `<img>` raw)
- [ ] **ASSET-04**: Font loading audit realizado; migração para `next/font` se houver requests externos
- [ ] **ASSET-05**: `next/script` com strategy apropriada para quaisquer scripts de terceiros

### Observabilidade e Medição (OBS)

- [ ] **OBS-01**: Lighthouse CI configurado com thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] **OBS-02**: RUM pipeline reportando CWV no 75º percentil para usuários reais
- [ ] **OBS-03**: `memlab` scenario configurado para fluxo de navegação de pacientes (heap snapshot diffing)
- [ ] **OBS-04**: `react-scan` integrado no ambiente de desenvolvimento para detecção de re-renders
- [ ] **OBS-05**: Relatório before/after de performance publicado com próximos passos acionáveis

## Future Requirements

### v1.5+ — Funcionalidades Financeiras Avançadas

- [ ] **RECP-01**: Emissão de recibos em PDF para cobranças pagas
- [ ] **RECP-02**: Template de recibo customizável com dados do psicólogo e paciente
- [ ] **RELA-01**: Relatório DRE simples (receitas vs despesas por período)
- [ ] **RELA-02**: Exportação IRPF / Carnê-Leão

### v1.5+ — Otimizações Avançadas

- [ ] **PERF-07**: React Compiler (aguardar integração SWC para evitar slowdown de build)
- [ ] **PERF-08**: Deep memory leak investigation (apenas se dados de campo mostrarem degradação de INP ao longo do tempo)
- [ ] **PERF-09**: Raw SQL para queries de relatório (escalar apenas se relatórios ORM ficarem lentos)
- [ ] **PERF-10**: Pipeline OpenTelemetry/Sentry completo (expandir a partir de `instrumentation.ts` simples)

## Out of Scope

- **Server-side notifications (Supabase real-time)** — requer infraestrutura adicional, não relacionado a performance de runtime
- **Push/Email notifications** — requer infraestrutura adicional
- **Nota Fiscal (NFS-e)** — alta complexidade de integração, não relacionado a performance
- **Integração Bancária (Open Finance)** — risco de segurança alto
- **Envio automático de recibos por Email/WhatsApp** — v1.5+
- **Redis cache layer customizado** — Next.js built-in caching é suficiente na escala atual
- **Prisma Accelerate** — lock-in desnecessário, Supavisor já provisionado
- **TanStack Query** — conflita com Server Components + React.cache()
- **Partytown** — `next/script` com strategy `worker` é suficiente

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| PERF-01 | Phase 27 | Pending |
| PERF-02 | Phase 27 | Pending |
| PERF-03 | Phase 27 | Pending |
| PERF-04 | Phase 27 | Pending |
| PERF-05 | Phase 27 | Pending |
| PERF-06 | Phase 27 | Pending |
| STREAM-01 | Phase 28 | Pending |
| STREAM-02 | Phase 28 | Pending |
| STREAM-03 | Phase 28 | Pending |
| STREAM-04 | Phase 28 | Pending |
| STREAM-05 | Phase 28 | Pending |
| CACHE-01 | Phase 29 | Pending |
| CACHE-02 | Phase 29 | Pending |
| CACHE-03 | Phase 29 | Pending |
| CACHE-04 | Phase 29 | Pending |
| ASSET-01 | Phase 30 | Pending |
| ASSET-02 | Phase 30 | Pending |
| ASSET-03 | Phase 30 | Pending |
| ASSET-04 | Phase 30 | Pending |
| ASSET-05 | Phase 30 | Pending |
| OBS-01 | Phase 31 | Pending |
| OBS-02 | Phase 31 | Pending |
| OBS-03 | Phase 31 | Pending |
| OBS-04 | Phase 31 | Pending |
| OBS-05 | Phase 31 | Pending |

---
*Requirements defined: 2026-04-23*
*Milestone: v1.4 Performance Profunda*
