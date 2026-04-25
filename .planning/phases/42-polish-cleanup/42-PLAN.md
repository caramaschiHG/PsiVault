# Phase 42: Polish e Cleanup — Plan

**Status:** Draft
**Phase:** 42
**Name:** Polish e Cleanup
**Depends on:** Phase 38, Phase 39, Phase 40, Phase 41
**Context:** Final phase of v1.6. All upstream features must be stable.

---

## Goal

Código legado removido, app estável, zero regressão, documentação atualizada. Documentos existentes de usuários reais permanecem intactos.

---

## Wave 1: Legacy Code Removal (Day 1)

### Plan 42-01: Remove Old Document Flow Code

**Objective:** Eliminar código do fluxo antigo que foi substituído.

**Tasks:**
1. **Remove localStorage auto-save**:
   - Delete `useAutoSave` hook usage from document composer (if not used elsewhere)
   - Remove `doc-draft-{patientId}-{type}` localStorage keys

2. **Remove `<textarea>` for formal documents**:
   - Edit page should use `DocumentEditor` for all types
   - Remove conditional: `session_record` → RichTextEditor, others → `<textarea>`

3. **Remove `<pre>` visualization**:
   - View page should use `DocumentPaperView` for all types
   - Remove conditional: `session_record` → dangerouslySetInnerHTML, others → `<pre>`

4. **Remove duplicate `VALID_TYPES`**:
   - Single source of truth: `DocumentType` from domain model
   - Update all pages/actions to import from domain

5. **Remove old `DocumentsSection` (collapsible by type)**:
   - Replaced by `DocumentTimeline`
   - Ensure no orphaned imports

**Success Criteria:**
- Zero references to old document flow patterns
- Bundle size reduced (no dead code)

---

## Wave 2: Test Coverage & Regression (Day 1-2)

### Plan 42-02: Comprehensive Test Suite

**Objective:** Garantir que nada quebrou e novos fluxos são testados.

**Tasks:**
1. **Migration test**:
   - Script que cria 1000 documentos no schema antigo, roda migration, verifica que todos têm status correto
   - Run in CI

2. **State transition tests**:
   - Unit: all valid transitions
   - Unit: all invalid transitions (expect errors)
   - Integration: action → database → audit

3. **PDF generation tests**:
   - Each document type generates PDF without error
   - PDF contains expected content
   - Signature appears when signed

4. **Regression tests**:
   - All 419 existing tests still pass
   - Patient CRUD unaffected
   - Appointment CRUD unaffected
   - Finance unaffected

5. **Security tests**:
   - Cross-workspace access blocked
   - Cross-patient access blocked
   - Draft content not in exports

**Success Criteria:**
- 500+ tests passing (419 existing + 80+ new)
- 100% coverage on state transitions
- Migration test passes

---

## Wave 3: Documentation Update (Day 2)

### Plan 42-03: Update CLAUDE.md and Docs

**Objective:** Documentação interna reflete o novo fluxo.

**Tasks:**
1. **Update `CLAUDE.md`**:
   - Document lifecycle: draft → finalized → signed → delivered → archived
   - Editor modes: free vs structured
   - PDF generation rules
   - Appointment linkage
   - Security: cross-patient guard location

2. **Update `AGENTS.md`** (if exists in subdirs):
   - Any document-specific rules

3. **Add inline comments** where architecture changed:
   - Repository methods
   - Server Actions
   - Domain guards

**Success Criteria:**
- Novo dev consegue entender o fluxo de documentos lendo CLAUDE.md
- Comentários explicam por que, não o que

---

## Wave 4: Final Audit (Day 3)

### Plan 42-04: Security & Performance Audit

**Objective:** Verificar que reforma não introduziu vulnerabilidades ou regressões.

**Tasks:**
1. **Security audit**:
   - Review all new Server Actions for workspace validation
   - Verify `importantObservations` never leaks in document queries
   - Check PDF route for authorization
   - Check draft content is excluded from exports (`canIncludeDocumentInPatientExports`)

2. **Performance audit**:
   - `/documentos` page loads <500ms with 100 documents
   - PDF generation <2s
   - Auto-save debounce não flood
   - No N+1 queries in listagens

3. **Accessibility audit**:
   - Badges de estado têm aria-labels
   - Filtros são navegáveis por teclado
   - Focus rings visíveis

**Success Criteria:**
- Zero security findings
- Performance igual ou melhor que antes
- Zero a11y regressões

---

## Verification Plan

- [ ] All legacy code removed (grep for old patterns)
- [ ] 500+ tests passing
- [ ] Migration test passes in CI
- [ ] CLAUDE.md updated
- [ ] Security audit clean
- [ ] Performance audit clean
- [ ] Build successful, zero TS errors
- [ ] Deploy to staging, manual smoke test

---

## Rollback Plan

If critical issue found after deploy:
1. Database: columns novas são nullable — código antigo pode ignorá-las
2. Code: revert commits da fase problemática
3. Data: nenhum dado existente foi alterado além do `status` — rollback é atualizar `status` para default

---

*Phase: 42-polish-cleanup*
*Plan created: 2026-04-25*
