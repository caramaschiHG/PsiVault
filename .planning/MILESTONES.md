# Milestones

## v1.0 MVP (Shipped: 2026-03-15)

**Phases completed:** 6 phases, 21 plans, 2 tasks

**Key accomplishments:**
- Design token system, component library, sidebar navigation
- Acessibilidade WCAG 2.1 AA, SVG icon system
- Notification bell básico com localStorage

---

## v1.1 Notifications (Shipped: 2026-03)

**Phases completed:** 4 phases (13–16)

**Key accomplishments:**
- Top bar com busca, sino e avatar
- Dropdown de notificações redesenhado
- Múltiplos tipos de notificação com ações contextuais
- Arquitetura de storage abstraída (localStorage → server-side ready)

---

## v1.2 Finance (Shipped: 2026-04)

**Phases completed:** 6 phases (17–22)

**Key accomplishments:**
- Refatoração UX/UI Finanças (Modais, Layout, Filtros)
- Módulo de Gestão de Despesas (CRUD, Categorias, Comprovantes)

---

## v1.3 Performance (Shipped: 2026-04-22)

**Phases completed:** 4 phases (23–26), 8 plans

**Key accomplishments:**
- Navegação client-side via `<Link>` (zero full reloads)
- Caching do Next.js habilitado (force-dynamic removido)
- resolveSession deduplicada via React.cache()
- Middleware: eliminação de dupla chamada getUser() + JWT AAL fast-path
- /financeiro: ~40 queries consolidadas em 3 via listByWorkspaceAndDateRange
- revalidatePath com escopo "page" em 13 server actions
- Agenda: N+1 clinical notes → 1 batch query (findByAppointmentIds)
- importantObservations excluído de listActive/listArchived via LIST_SELECT

---

## v1.4 Performance Profunda (In Progress)

**Goal:** Eliminar gargalos remanescentes de performance e atingir fluidez objetivamente mensurável via Core Web Vitals e métricas de runtime.

**Started:** 2026-04-23

---

## v1.5 Motion & Feel — Interações Fluidas (In Progress)

**Goal:** Elevar a percepção de qualidade do PsiVault através de animações sutis, micro-interações e refinamentos visuais que criam uma experiência clinicamente calma, estável e agradável.

**Started:** 2026-04-23

---
