# Phase 38: Estados e Rascunho Server-Side — Plan

**Status:** Draft
**Phase:** 38
**Name:** Estados e Rascunho Server-Side
**Depends on:** Phase 37
**Context:** Requires Phase 37 schema and domain model complete.

---

## Goal

Documentos têm ciclo de vida claro (draft → finalized → signed → delivered) com auto-save server-side e listagem inteligente por estado. Nenhum dado é perdido; rascunhos vivem no servidor, não no localStorage.

---

## Wave 1: Server Actions de Transição (Day 1)

### Plan 38-01: State Transition Server Actions

**Objective:** Implementar actions seguras para transições de estado.

**Tasks:**
1. **Create `finalizeDocumentAction`** (`src/app/(vault)/patients/[patientId]/documents/[documentId]/finalize/actions.ts`):
   - Validates session → accountId, workspaceId
   - Loads document via repository
   - Cross-patient guard + workspace guard
   - Calls `finalizeDocument(domain)`
   - Saves via repository
   - Emits `document.finalized` audit
   - Revalidates path

2. **Create `signDocumentAction`**:
   - Same guards
   - Verifies `signatureAsset` exists in profile (regra: só pode assinar se tiver assinatura configurada)
   - Calls `signDocument(domain, accountId)`
   - Saves
   - Emits `document.signed` audit

3. **Create `deliverDocumentAction`**:
   - Same guards
   - Receives `deliveredTo`, `deliveredVia` (whatsapp | email | print | in_person)
   - Calls `deliverDocument(domain, accountId, {to, via})`
   - Saves
   - Emits `document.delivered` audit

4. **Update `createDocumentAction`**:
   - Always creates as `draft` status
   - Remove gate de assinatura da criação
   - Emits `document.draft_saved` audit

5. **Update `updateDocumentAction`**:
   - Only allows edit if status is `draft` or `finalized`
   - Blocks edit if `signed` or `delivered`
   - If editing a `finalized`, revert to `draft` (ou manter finalized? decisão: manter finalized, permitir edit)
   - Actually: block edit on `signed`/`delivered`/`archived`; allow on `draft`/`finalized`

**Success Criteria:**
- Each action has unit + integration tests
- Invalid transitions are rejected with clear error messages

---

## Wave 2: Auto-Save Server-Side (Day 1-2)

### Plan 38-02: Draft Auto-Save

**Objective:** Rascunhos salvam no servidor a cada 3s debounce.

**Tasks:**
1. **Create `saveDraftAction`**:
   - Receives `documentId?`, `patientId`, `documentType`, `content`
   - If `documentId` exists and doc is draft: update content
   - If no `documentId`: create new draft
   - Returns `{ documentId, savedAt }`
   - Emits `document.draft_saved` audit (throttled — não a cada auto-save)

2. **Client-side debounce hook** (`src/hooks/useDocumentAutoSave.ts`):
   - 3s debounce on content change
   - Calls `saveDraftAction` via `useTransition`
   - Shows indicator: "Salvando..." → "Salvo às 14:32" → "Erro ao salvar"
   - Handles offline gracefully (retry queue)

3. **Draft cleanup**:
   - Old drafts (30+ days) can be cleaned by a future background job; for now, leave as-is

**Success Criteria:**
- Auto-save works without full page reload
- Indicator shows clear status with timestamp
- No localStorage usage for document drafts

---

## Wave 3: Listagem com Estados (Day 2-3)

### Plan 38-03: Document Timeline List

**Objective:** Substituir listagem por tipo/collapsible por timeline cronológica com badges de estado.

**Tasks:**
1. **Create `DocumentTimeline` component** (`src/app/(vault)/patients/[patientId]/components/document-timeline.tsx`):
   - Server Component: loads documents via `listActiveByPatientWithStatus`
   - Ordena por `createdAt` desc
   - Badges: Rascunho (cinza), Pendente (amarelo), Assinado (verde), Entregue (azul), Arquivado (cinza escuro)
   - Cada item mostra: tipo, data, estado, ações rápidas

2. **Ações inline por estado:**
   - Rascunho: "Continuar", "Finalizar", "Excluir"
   - Finalizado: "Assinar", "Editar", "Visualizar"
   - Assinado: "Entregar", "Baixar PDF", "Visualizar"
   - Entregue: "Visualizar", "Baixar PDF"
   - Arquivado: "Visualizar" (apenas)

3. **Filtros rápidos**:
   - Tabs ou chips: "Todos", "Rascunhos", "Pendentes", "Assinados", "Entregues", "Arquivados"
   - Filtro é client-side para lista pequena; server-side se >50 docs

4. **Update `DocumentsSection`** para usar `DocumentTimeline`

**Success Criteria:**
- Listagem cronológica funciona
- Badges de estado são claros e acessíveis
- Ações rápidas funcionam sem navegação de página

---

## Verification Plan

- [ ] Test: criar draft → auto-save → finalize → sign → deliver → archive
- [ ] Test: tentar editar signed → deve falhar
- [ ] Test: tentar sign sem signatureAsset → deve falhar com mensagem clara
- [ ] Test: listagem mostra documentos em ordem correta com badges certos
- [ ] TypeScript zero errors
- [ ] 419+ tests pass

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Auto-save flood de actions | Debounce 3s + useTransition |
| User confuso com estados | Badges com labels claros em português |
| Documentos antigos sem estado | Migration já resolveu (Phase 37) |

---

*Phase: 38-estados-e-rascunho*
*Plan created: 2026-04-25*
