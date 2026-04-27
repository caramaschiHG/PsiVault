# Phase 43: Arquitetura Multi-Agent Foundation — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 43-arquitetura-multi-agent-foundation
**Areas discussed:** Execution Model, Queue Strategy, Agent Scope & Registration, Priority & Interruption Model

---

## Execution Model

| Option | Description | Selected |
|--------|-------------|----------|
| Cron-only polling | Agents run on scheduled intervals. Simpler but less responsive. | |
| Event-driven + cron hybrid | User actions enqueue tasks immediately; cron processes queue every 15 min. | ✓ |
| Event-driven immediate | Agent logic runs inline with Server Actions. Fastest but risky. | |

**User's choice:** Event-driven + cron hybrid
**Notes:** Best of both worlds — immediate task enqueue on user action, background processing via cron.

### Follow-up decisions
| Question | Options | Selected |
|----------|---------|----------|
| Cron frequency | Every 5 min / Every 15 min / Every 60 min | Every 15 minutes |
| Cron endpoint | Separate `/api/cron/agents` / Shared with notifications | Separate endpoint |
| Event triggers | All appointment mutations / Only terminal states / Manual only | All appointment mutations + session completion |

---

## Queue Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Extend NotificationJob | Reuse existing table, add agent fields. Less work but mixed concerns. | |
| New AgentTask table | Dedicated table for agent tasks. Clean separation. | ✓ |
| Hybrid both tables | Keep NotificationJob for emails, AgentTask for intelligence. | |

**User's choice:** New dedicated AgentTask table
**Notes:** Cleanest separation of concerns between email queue and agent intelligence queue.

### Follow-up decisions
| Question | Options | Selected |
|----------|---------|----------|
| Task statuses | PENDING/PROCESSING/COMPLETED/FAILED/CANCELED vs PENDING/RUNNING/DONE/ERROR/SKIPPED | PENDING, RUNNING, DONE, ERROR, SKIPPED |
| Retry strategy | 3 retries with backoff / 1 retry / No retry | 3 retries (5min, 15min, 45min) |

---

## Agent Scope & Registration

| Question | Options | Selected |
|----------|---------|----------|
| Scope | Per-workspace / Global with filtering | Per-workspace with configuration |
| Registration | Static in code / Dynamic runtime | Dynamic runtime registration |
| Default state | All enabled / All disabled | All disabled by default (opt-in) |

**User's choice:** Per-workscope, dynamic runtime, opt-in by default
**Notes:** Aligns with Phase 47 monitoring UI, Calm UX (don't surprise user), and future plugin system.

---

## Priority & Interruption Model

| Question | Options | Selected |
|----------|---------|----------|
| Priority effect | Execution order only / Both order and delivery | Both execution order AND delivery channel |
| Delivery channels | Calm hierarchy / All non-critical to notification/digest | Calm hierarchy mapping |
| Override | Fixed per agent / Agent base + task override | Agent base priority, task can override |

**User's choice:** Both order and delivery, Calm hierarchy, override supported
**Notes:** Full integration of ARCH-02 and CALM-04. Hierarchy:
- critical → status light
- high → badge
- medium → notification dropdown
- low → daily digest

---

## the agent's Discretion

No areas explicitly deferred to the agent. All major architectural decisions were locked by the user.

## Deferred Ideas

- Google Calendar/Outlook sync (AGEND-05) — v2.1+
- ML-based cancellation prediction (AGEND-06) — v2.1+
- Plugin system (ARCH-05) — v2.1+
- Research agent (ARCH-06) — v2.1+
- Documentation agent (ARCH-07) — v2.1+
- Push notifications (real-time) — v2.2+

---

*Phase: 43-arquitetura-multi-agent-foundation*
*Discussion completed: 2026-04-27*
