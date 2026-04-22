# PsiVault — Plataforma Clínica para Psicólogos

## What This Is

PsiVault é uma plataforma web completa para psicólogos gerenciarem sua prática clínica — pacientes, agenda, prontuários, documentos e financeiro. Construída com Next.js 15, Supabase, e Prisma, com foco em segurança (multi-tenant, audit trail) e UX premium.

## Core Value

Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## Current Milestone: v1.3 Performance

**Goal:** Eliminar a lentidão sistêmica do app resolvendo os 10 problemas identificados em auditoria de performance — das navegações com full-reload às queries explosivas no /financeiro.

**Target features:**
- Wave 1 — Navegação e Cache: `<a>`→`<Link>` em sidebar/bottom nav, remover `force-dynamic` do vault layout, `React.cache()` em `resolveSession`
- Wave 2 — Auth Supabase: eliminar dupla chamada `getUser()`, reduzir MFA check no middleware
- Wave 3 — Finance Queries: consolidar ~44 queries em agregações SQL, defer charts para client-side, narrowar `revalidatePath`
- Wave 4 — N+1 e Limpeza: batch de clinical notes na agenda, select de colunas em listagens de pacientes

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

### Active

<!-- Current scope — v1.3 Performance -->

- [ ] Navegação client-side via Next.js Link (eliminar full reloads)
- [ ] Remoção de force-dynamic no vault layout (habilitar caching)
- [ ] Deduplicação de resolveSession via React.cache()
- [ ] Eliminação da dupla chamada getUser() middleware + page
- [ ] Redução de MFA check no middleware (apenas quando necessário)
- [ ] Consolidação das queries do /financeiro (~44 → agregação SQL)
- [ ] Defer de trend/year charts para client-side
- [ ] Narrowar revalidatePath nas server actions
- [ ] Batch de clinical notes query na agenda (eliminar N+1)
- [ ] Select de colunas necessárias em listagens de pacientes

### Out of Scope

- Emissão de Recibos em PDF — Phase 21, adiada para v1.4
- Relatórios e Fluxo de Caixa — Phase 22, adiada para v1.4
- Server-side notifications (Supabase real-time) — será v1.4+
- Push notifications (web push API) — complexidade alta
- Email notifications — requer infraestrutura de email
- Nota Fiscal (NFS-e) — alta complexidade de integração
- Integração Bancária (Open Finance) — risco de segurança alto

## Context

- App sofre de lentidão sistêmica em todos os cliques — reproduzível localmente (não é problema de Vercel)
- Causa raiz identificada em auditoria 2026-04-22:
  - Sidebar/bottom nav usam `<a href>` em vez de `<Link>` (full page reload em cada clique)
  - `force-dynamic` no vault layout desabilita todo caching do Next.js
  - `/financeiro` dispara ~44 queries de DB por page load
  - Server actions chamam `revalidatePath` que dispara o render de 44 queries
  - Middleware faz 2-3 round-trips Supabase por request
- Design system maduro com 50+ CSS tokens, componentes reutilizáveis
- Testes: 351/351 passando, bundle lean

## Constraints

- **Stack**: Next.js 15, React 19, Supabase, Prisma, CSS tokens (sem Tailwind)
- **Estilo**: Usar design tokens existentes, zero inline styles em componentes novos
- **Compatibilidade**: Manter comportamento visual e funcional idêntico — performance sem regressão
- **Segurança**: MFA/auth deve continuar funcionando corretamente após refatorações
- **Testes**: 351 testes existentes devem continuar passando

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design tokens over Tailwind | Controle total, performance, consistência | ✓ Good |
| localStorage para notificações v1 | Velocidade de entrega, sem dependência backend | ✓ Good |
| Top bar layout (Gmail/Notion style) | Padrão UX familiar | ✓ Good |
| Abstração de storage | Facilita migração futura para server-side | ✓ Good |
| force-dynamic no layout (v1.0-v1.2) | Simplicidade inicial, sem pensar em cache | → Removido em v1.3 |
| `<a>` em vez de `<Link>` na nav (v1.0) | Oversight inicial | → Corrigido em v1.3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 — Milestone v1.3 Performance started*
