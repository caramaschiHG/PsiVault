# PsiVault — Plataforma Clínica para Psicólogos

## What This Is

PsiVault é uma plataforma web completa para psicólogos gerenciarem sua prática clínica — pacientes, agenda, prontuários, documentos e financeiro. Construída com Next.js 15, Supabase, e Prisma, com foco em segurança (multi-tenant, audit trail) e UX premium.

## Core Value

Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## Current Milestone: v1.2 Financeiro Completo e UX

**Goal:** Refatorar a experiência de uso da aba de finanças e expandir suas capacidades para uma gestão completa de fluxo de caixa e emissão de documentos.

**Target features:**
- Refatoração da UX/UI atual (substituir formulários inline por modais/drawers, melhorar visualização de inadimplência)
- Módulo de Despesas (lançamento de saídas, categorização de custos do consultório)
- Emissão de Recibos em PDF (geração com dados do psicólogo, paciente, CPF, CRP)
- Relatórios Consolidados (visão de lucro/prejuízo, fluxo de caixa e exportação)

## Requirements

### Validated

<!-- Shipped and confirmed valuable — v1.0 -->

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

### Active

<!-- Current scope — v1.2 Financeiro Completo e UX -->

- [ ] Refatoração UX/UI Finanças (Modais, Layout, Filtros)
- [ ] Módulo de Gestão de Despesas (CRUD e Categorias)
- [ ] Emissão de Recibos em PDF
- [ ] Relatórios e Fluxo de Caixa (DRE simples)

### Out of Scope

- Server-side notifications (Supabase real-time) — será v1.2, após validar UX
- Push notifications (web push API) — complexidade alta, não essencial agora
- Email notifications — requer infraestrutura de email
- Backend/API changes para notificações — manter client-side por enquanto

## Context

- App já tem sistema de notificações básico (bell na sidebar, dropdown inline styles)
- Design system maduro com 50+ CSS tokens, componentes reutilizáveis
- Layout: sidebar 240px + content area, mobile com bottom nav
- Testes: 351/351 passando, bundle lean (102 kB shared JS)
- Notificações atuais: apenas "update" changelog, sem categorias/timestamps/ações

## Constraints

- **Stack**: Next.js 15, React 19, Supabase, Prisma, CSS tokens (sem Tailwind)
- **Estilo**: Usar design tokens existentes, zero inline styles em componentes novos
- **Compatibilidade**: Manter sidebar nav existente funcional
- **Performance**: Bundle impact mínimo, lazy load do dropdown
- **Migração**: Arquitetura deve permitir trocar localStorage por Supabase sem refatorar UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design tokens over Tailwind | Controle total, performance, consistência | ✓ Good |
| localStorage para notificações v1 | Velocidade de entrega, sem dependência backend | — Pending |
| Top bar layout (Gmail/Notion style) | Padrão UX familiar, sino no canto superior direito | — Pending |
| Abstração de storage | Facilita migração futura para server-side | — Pending |

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
*Last updated: 2026-04-21 after milestone v1.2 started*
