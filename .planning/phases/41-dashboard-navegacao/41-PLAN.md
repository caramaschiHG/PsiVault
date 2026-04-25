# Phase 41: Dashboard e Navegação — Plan

**Status:** Draft
**Phase:** 41
**Name:** Dashboard e Navegação
**Depends on:** Phase 38, Phase 39
**Context:** Requires status lifecycle and editor stable.

---

## Goal

Usuários navegam e visualizam todos os documentos do workspace de forma centralizada, com hierarquia clara, filtros poderosos e breadcrumbs intuitivos.

---

## Wave 1: Global Document Dashboard (Day 1-2)

### Plan 41-01: /documentos Page

**Objective:** Página global com todos os documentos do workspace.

**Tasks:**
1. **Create `/documentos` page** (`src/app/(vault)/documentos/page.tsx`):
   - Server Component: loads documents via `listActiveByWorkspace` (new repository method)
   - Cursor pagination (infinite scroll or "Carregar mais")
   - Default order: `createdAt` desc
   - Columns: Tipo, Paciente, Data, Estado, Ações

2. **Create `listActiveByWorkspace` repository method**:
   - Workspace-scoped
   - Exclude `importantObservations` (não aplica a documentos, mas regra geral)
   - Support filtering by status, type, date range
   - Cursor pagination by `createdAt`

3. **Filters**:
   - Tipo: dropdown com checkboxes
   - Estado: chips (Todos, Rascunhos, Pendentes, Assinados, Entregues, Arquivados)
   - Paciente: search by name
   - Data: date range picker
   - Aplicar como query params para shareable URLs

**Success Criteria:**
- Página carrega em <500ms
- Filtros funcionam isolados e combinados
- URL reflete filtros ativos

---

## Wave 2: Breadcrumbs (Day 2)

### Plan 41-02: Hierarchical Breadcrumbs

**Objective:** Breadcrumbs em todos os fluxos de documentos.

**Tasks:**
1. **Create `Breadcrumb` component** (`src/components/breadcrumb.tsx`):
   - Accepts array of `{ label, href? }`
   - Separator: `>` chevron
   - Last item is current page (no link)
   - Mobile: truncate middle items

2. **Add breadcrumbs to document flows**:
   - `/patients/[id]/documents/new`: Pacientes > [Nome] > Documentos > Novo
   - `/patients/[id]/documents/[docId]`: Pacientes > [Nome] > Documentos > [Tipo]
   - `/patients/[id]/documents/[docId]/edit`: ... > Editar
   - `/documentos`: Documentos
   - `/documentos?type=...`: Documentos > [Tipo]

3. **Dynamic labels**:
   - Patient name fetched server-side
   - Document type label from presenter

**Success Criteria:**
- Breadcrumbs presentes em 100% dos fluxos de documentos
- Labels dinâmicas corretas
- Mobile não quebra layout

---

## Wave 3: Patient Profile Tabs (Day 2-3)

### Plan 41-03: Tabbed Patient Profile

**Objective:** Perfil do paciente com abas preservando estado na URL.

**Tasks:**
1. **Create tabbed layout** (`src/app/(vault)/patients/[patientId]/layout.tsx` ou page refactor):
   - Tabs: Visão Geral, Clínico, Documentos, Financeiro
   - Tab ativo vindo de `?tab=` query param
   - Default: "Visão Geral"

2. **Deep-linking**:
   - `/patients/[id]?tab=documentos` abre direto na aba Documentos
   - Refresh mantém aba ativa
   - Links externos podem apontar para aba específica

3. **Content per tab**:
   - Visão Geral: header do paciente, próximo atendimento, resumo
   - Clínico: timeline de atendimentos
   - Documentos: `DocumentTimeline` (Phase 38)
   - Financeiro: cobranças existentes

**Success Criteria:**
- Navegação entre tabs é instantânea (client-side)
- URL reflete tab ativa
- Deep-linking funciona

---

## Verification Plan

- [ ] `/documentos` lista todos os documentos do workspace
- [ ] Filtros combinados funcionam
- [ ] Breadcrumbs corretos em todos os fluxos
- [ ] Tabs preservam estado na URL
- [ ] Mobile: layout não quebra

---

*Phase: 41-dashboard-navegacao*
*Plan created: 2026-04-25*
