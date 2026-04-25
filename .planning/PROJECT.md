# PsiVault — Plataforma Clínica para Psicólogos

## What This Is

PsiVault é uma plataforma web completa para psicólogos gerenciarem sua prática clínica — pacientes, agenda, prontuários, documentos e financeiro. Construída com Next.js 15, Supabase, e Prisma, com foco em segurança (multi-tenant, audit trail) e UX premium. App v1.3 Performance: navegação instantânea, caching habilitado, queries otimizadas.

## Core Value

Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## Current Milestone: v1.6 Documentos — Workflow Clínico Impecável

**Goal:** Transformar a experiência de documentação clínica do PsiVault em um workflow fluido, seguro e clinicamente maduro — da sessão ao prontuário, do registro ao documento formal — com UX inspirada nos melhores sistemas de documentação médica do mundo.

**Target features:**
- Timeline clínica redesenhada: visual de linha do tempo com cards simplificados, agrupamento por período, escaneabilidade imediata
- Editor de notas aprimorado: auto-save visível, modo foco, templates clínicos (SOAP, BIRP, livre), keyboard shortcuts
- Editor de documentos premium: preview de PDF, templates visuais, toolbar rica com formatação real
- Fluxo integrado sessão → nota: da agenda direto para registro de prontuário sem saltos de página
- Dashboard de documentos: visão global `/documentos` com filtros por tipo, paciente, data; documentos recentes e pendentes
- Navegação hierárquica: breadcrumbs, tabs no perfil do paciente (Visão Geral, Clínico, Documentos, Financeiro)
- Quick actions e atalhos: criação de nota/documento em 1-2 cliques, keyboard shortcuts para ações de fluxo

## Previous Milestone: v1.5 Motion & Feel — Interações Fluidas (Shipped)

**Goal:** Elevar a percepção de qualidade do PsiVault através de animações sutis, micro-interações e refinamentos visuais que criam uma experiência clinicamente calma, estável e agradável — sem cair em exagero decorativo.

**Shipped:**
- Motion tokens (duration, easing, stagger) e utility classes CSS
- Micro-interações em botões, cards, inputs, navegação
- Feedback de ação (toast animation, skeleton shimmer, button loading)
- Animações em listas (staggered entry) e transições de página (fade 150ms)
- Expand/collapse suave via grid-template-rows
- Compatibilidade total com prefers-reduced-motion

**Parallel milestone:** v1.4 Performance Profunda (Phases 27–31, shipped 2026-04-23).

**Goal:** Eliminar gargalos remanescentes de performance e atingir fluidez objetivamente mensurável via Core Web Vitals e métricas de runtime.

**Target features:**
- Diagnóstico completo de bundle size, re-renders e memory leaks
- Otimização de queries no banco (indexing, connection pooling, query plans)
- Streaming de Server Components com Suspense boundaries estratégicas
- Otimização de assets (imagens, fontes, third-party scripts)
- Métricas objetivas: LCP, INP, CLS, TTFB dentro dos thresholds do Google

## Current State (v1.6 Documentos — Defining Requirements)

Milestone v1.5 completou o sistema de motion e feel:
- Motion tokens (duration, easing, stagger) consolidados em motion.css
- Micro-interações em todos os componentes base
- List stagger animations e page transitions
- Expand/collapse orgânico sem layout shift
- Zero regressão de performance, 419/419 tests passando

Milestone v1.3 eliminou a lentidão sistêmica identificada em auditoria:
- Navegação client-side via `<Link>` (zero full reloads)
- Caching do Next.js habilitado (force-dynamic removido)
- /financeiro: ~40 queries → 3 por page load
- Agenda: N+1 de clinical notes → 1 query batch
- `importantObservations` excluído de todas as queries de listagem

Stack: Next.js 15, React 19, TypeScript 5.8 (strict), Prisma 6, PostgreSQL (Supabase), Supabase Auth (SSR)
Tests: 419/419 passing

**Contexto documentação existente:**
- Document composer com RichTextEditor, auto-save indicator, agrupamento por tipo
- Note composer com auto-save local, formatação básica
- Documents section com grupos colapsáveis por tipo e badges de contagem
- Análise UX prévia (`document-flow-ux-plan.md`) identifica 10 problemas críticos/importantes

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Design token system (cores, radius, shadows, spacing, z-index, font-size) — v1.0
- ✓ Component library (PageHeader, Section, Card, StatCard, List, Badge, Toast) — v1.0
- ✓ Sidebar navigation com drawer mobile — v1.0
- ✓ Acessibilidade WCAG 2.1 AA (focus states, aria, keyboard nav) — v1.0
- ✓ SVG icon system (zero emojis estruturais) — v1.0
- ✓ Notification bell básico com localStorage — v1.0
- ✓ Top bar com busca, sino e avatar — v1.1
- ✓ Dropdown de notificações redesenhado — v1.1
- ✓ Múltiplos tipos de notificação com ações contextuais — v1.1
- ✓ Arquitetura de storage abstraída (localStorage → server-side ready) — v1.1
- ✓ Refatoração UX/UI Finanças (Modais, Layout, Filtros) — v1.2 Phase 19
- ✓ Módulo de Gestão de Despesas (CRUD, Categorias, Comprovantes) — v1.2 Phase 20
- ✓ Navegação client-side via Next.js Link (zero full reloads) — v1.3
- ✓ Vault layout com caching do Next.js (force-dynamic removido) — v1.3
- ✓ resolveSession deduplicada via React.cache() — v1.3
- ✓ Middleware: eliminação de dupla chamada getUser() + JWT AAL fast-path — v1.3
- ✓ /financeiro: ~40 queries consolidadas em 3 via listByWorkspaceAndDateRange — v1.3
- ✓ revalidatePath com escopo "page" em 13 server actions — v1.3
- ✓ Agenda: N+1 clinical notes → 1 batch query (findByAppointmentIds) — v1.3
- ✓ importantObservations excluído de listActive/listArchived via LIST_SELECT — v1.3
- ✓ Micro-interações em componentes base (hover, focus, active, floating labels, error shake, smooth scroll) — v1.5 Phase 33

### Active

<!-- Current milestone scope — v1.6 Documentos -->

- [ ] Timeline clínica redesenhada com linha do tempo visual e cards simplificados (TIME-01, TIME-02)
- [ ] Editor de notas com templates clínicos (SOAP, BIRP, livre) e modo foco (NOTE-01, NOTE-02)
- [ ] Editor de documentos com preview de PDF e templates visuais (DOCM-01, DOCM-02)
- [ ] Fluxo integrado sessão → nota direto da agenda (FLOW-01, FLOW-02)
- [ ] Dashboard de documentos com filtros globais (DASH-01, DASH-02)
- [ ] Navegação hierárquica: breadcrumbs e tabs no perfil do paciente (NAV-01, NAV-02)
- [ ] Quick actions e keyboard shortcuts para ações de fluxo (QUICK-01, QUICK-02)

### Out of Scope

- Server-side notifications (Supabase real-time) — v1.4+
- Push/Email notifications — requer infraestrutura adicional
- Nota Fiscal (NFS-e) — alta complexidade de integração
- Integração Bancária (Open Finance) — risco de segurança alto
- Envio automático de recibos por Email/WhatsApp — v1.4+

## Context

- App estável com 419 testes, bundle lean
- Performance resolvida em v1.3-v1.4 — navegação, caching, queries, CWV
- Design system maduro com 50+ CSS tokens, motion tokens, componentes reutilizáveis
- Multi-tenant, workspace-scoped, audit trail completo
- Próximas demandas: workflow de documentação clínica (timeline, notas, documentos, fluxo integrado)

## Constraints

- **Stack**: Next.js 15, React 19, Supabase, Prisma, CSS tokens (sem Tailwind)
- **Estilo**: Usar design tokens existentes, zero inline styles em componentes novos
- **Segurança**: MFA/auth deve continuar funcionando corretamente após refatorações
- **Sensibilidade**: importantObservations nunca em listagens — apenas findById e backup export
- **Testes**: 419 testes existentes devem continuar passando

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design tokens over Tailwind | Controle total, performance, consistência | ✓ Good |
| localStorage para notificações v1 | Velocidade de entrega, sem dependência backend | ✓ Good |
| Top bar layout (Gmail/Notion style) | Padrão UX familiar | ✓ Good |
| Abstração de storage | Facilita migração futura para server-side | ✓ Good |
| force-dynamic no layout (v1.0-v1.2) | Simplicidade inicial, sem pensar em cache | → Removido em v1.3 |
| `<a>` em vez de `<Link>` na nav (v1.0) | Oversight inicial | → Corrigido em v1.3 |
| listByWorkspaceAndDateRange para /financeiro | Range único cobre trend+year+prev, grouping in-memory | ✓ Good |
| findByAppointmentIds retorna Set<string> | Agenda só precisa de presença, não conteúdo da nota | ✓ Good |
| listAllByWorkspace para backup | Backup precisa de dados completos — separado de listagens | ✓ Good |
| JWT AAL fast-path no middleware | Decodifica claim do cookie, skipa API call para aal2 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-25 after Milestone v1.6 started: Documentos — Workflow Clínico Impecável*
