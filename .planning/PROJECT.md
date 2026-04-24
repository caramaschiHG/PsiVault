# PsiVault — Plataforma Clínica para Psicólogos

## What This Is

PsiVault é uma plataforma web completa para psicólogos gerenciarem sua prática clínica — pacientes, agenda, prontuários, documentos e financeiro. Construída com Next.js 15, Supabase, e Prisma, com foco em segurança (multi-tenant, audit trail) e UX premium. App v1.3 Performance: navegação instantânea, caching habilitado, queries otimizadas.

## Core Value

Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## Current Milestone: v1.5 Motion & Feel — Interações Fluidas

**Goal:** Elevar a percepção de qualidade do PsiVault através de animações sutis, micro-interações e refinamentos visuais que criam uma experiência clinicamente calma, estável e agradável — sem cair em exagero decorativo.

**Target features:**
- Transições de página e navegação fluidas (soft enter/exit)
- Micro-interações em botões, cards e formulários (hover, focus, active states)
- Estados de loading e skeletons com movimento orgânico
- Animações em listas e tabelas (adicionar, remover, reordenar itens)
- Feedback visual de ações bem-sucedidas e erros (toasts, subtle shakes, fades)
- Refinamentos de tipografia, espaçamento e ritmo visual
- Redução de "jump" em layouts via animações de altura/controladas
- Cursor e scroll behavior refinado
- Compatibilidade com preferência de reduced motion do sistema

**Parallel milestone:** v1.4 Performance Profunda continua em execução em workstream separado.

## Previous Milestone: v1.4 Performance Profunda (In Progress — Parallel)

**Goal:** Eliminar gargalos remanescentes de performance e atingir fluidez objetivamente mensurável via Core Web Vitals e métricas de runtime.

**Target features:**
- Diagnóstico completo de bundle size, re-renders e memory leaks
- Otimização de queries no banco (indexing, connection pooling, query plans)
- Streaming de Server Components com Suspense boundaries estratégicas
- Otimização de assets (imagens, fontes, third-party scripts)
- Métricas objetivas: LCP, INP, CLS, TTFB dentro dos thresholds do Google

## Current State (v1.5 Motion & Feel — Phase 33 Complete)

Milestone v1.3 eliminou a lentidão sistêmica identificada em auditoria:
- Navegação client-side via `<Link>` (zero full reloads)
- Caching do Next.js habilitado (force-dynamic removido)
- /financeiro: ~40 queries → 3 por page load
- Agenda: N+1 de clinical notes → 1 query batch
- `importantObservations` excluído de todas as queries de listagem

Stack: Next.js 15, React 19, TypeScript 5.8 (strict), Prisma 6, PostgreSQL (Supabase), Supabase Auth (SSR)
Tests: 419/419 passing

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

<!-- Next milestone scope — v1.4 -->

- [ ] Emissão de recibos em PDF para cobranças pagas (RECP-01, RECP-02)
- [ ] Relatórios: DRE simples, export IRPF/Carnê-Leão (RELA-01, RELA-02)
- [ ] Streaming visual de charts com Suspense (melhoria v1.4)
- [ ] Column selection para endpoints de search de pacientes

### Out of Scope

- Server-side notifications (Supabase real-time) — v1.4+
- Push/Email notifications — requer infraestrutura adicional
- Nota Fiscal (NFS-e) — alta complexidade de integração
- Integração Bancária (Open Finance) — risco de segurança alto
- Envio automático de recibos por Email/WhatsApp — v1.4+

## Context

- App estável com 407 testes, bundle lean
- Performance resolvida em v1.3 — navegação, caching, queries
- Design system maduro com 50+ CSS tokens, componentes reutilizáveis
- Multi-tenant, workspace-scoped, audit trail completo
- Próximas demandas: funcionalidades financeiras avançadas (recibos, relatórios)

## Constraints

- **Stack**: Next.js 15, React 19, Supabase, Prisma, CSS tokens (sem Tailwind)
- **Estilo**: Usar design tokens existentes, zero inline styles em componentes novos
- **Segurança**: MFA/auth deve continuar funcionando corretamente após refatorações
- **Sensibilidade**: importantObservations nunca em listagens — apenas findById e backup export
- **Testes**: 407 testes existentes devem continuar passando

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
*Last updated: 2026-04-24 after Phase 33: Micro-interações em Componentes Base (v1.5 Motion & Feel)*
