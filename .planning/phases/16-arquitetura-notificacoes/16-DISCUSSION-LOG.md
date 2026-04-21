# Phase 16: Arquitetura de Notificações - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 16-arquitetura-notificacoes
**Areas discussed:** Estrutura dos tipos, Padrão do Storage, CSS approach

---

## Estrutura dos Tipos

| Option | Description | Selected |
|--------|-------------|----------|
| Union discriminada | Campo `type` literal com dados extras tipados por tipo | ✓ |
| Interfaces separadas | Uma interface por tipo, sem base comum | |
| Generic wrapper | `Notification<T>` com payload genérico | |

**User's choice:** Agent's discretion — user deferred all decisions
**Notes:** Union discriminada chosen for type narrowing benefits and clean switch/case patterns

---

## Padrão do Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Interface simples (get/save/clear) | Mínima, sem observers, reatividade via React | ✓ |
| Observer pattern | Storage notifica listeners quando dados mudam | |
| Repository com subscriptions | Pattern mais robusto com real-time sync entre tabs | |

**User's choice:** Agent's discretion — user deferred all decisions
**Notes:** Interface simples chosen to minimize complexity and keep swap to Supabase trivial

---

## CSS Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Classes globais em globals.css | Prefixo `.notif-`, consistente com projeto existente | ✓ |
| CSS Modules (.module.css) | Scoping automático, mas padrão diferente do projeto | |

**User's choice:** Agent's discretion — user deferred all decisions
**Notes:** Global classes with `.notif-` prefix chosen for consistency with project patterns

## Agent's Discretion

All three gray areas were deferred to agent's judgment by the user.

## Deferred Ideas

None — discussion stayed within phase scope
