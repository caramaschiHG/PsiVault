# Phase 40: Integração com Atendimentos — Plan

**Status:** Draft
**Phase:** 40
**Name:** Integração com Atendimentos
**Depends on:** Phase 37, Phase 38
**Context:** Requires schema with `appointmentId` and status lifecycle.

---

## Goal

Documentos nascem do contexto clínico correto. Ligação opcional com atendimentos permite pre-fill preciso e fluxo contínuo sessão → nota → documento.

---

## Wave 1: Appointment Linkage Core (Day 1)

### Plan 40-01: Appointment-Aware Document Creation

**Objective:** Documentos podem ser criados vinculados a um atendimento específico.

**Tasks:**
1. **Update `createDocumentAction`**:
   - Accept optional `appointmentId` in FormData
   - Validate: if provided, appointment exists, belongs to patient + workspace
   - Store `appointmentId` in document

2. **Update document view page**:
   - If `appointmentId` present, show appointment context: "Vinculado ao atendimento de 25/04/2026, 14:00"
   - Link to appointment (if accessible)

3. **Update document list**:
   - Show appointment badge on timeline items when linked

**Success Criteria:**
- Document created with appointmentId stores correctly
- Validation prevents cross-patient appointment linking

---

## Wave 2: Session→Document Quick Flow (Day 1-2)

### Plan 40-02: Quick Document from Appointment

**Objective:** Criar documento diretamente da página de atendimento ou da agenda.

**Tasks:**
1. **Add "Criar documento" to appointment context**:
   - In agenda: when appointment is COMPLETED, show quick action "Criar declaração" or "Criar nota"
   - In appointment detail (if exists): button "Novo documento para este atendimento"

2. **Pre-fill with appointment context**:
   - `appointmentId` passed via query param: `?appointmentId=xxx`
   - Composer page reads appointment and pre-fills:
     - Date, time, care mode
     - For `attendance_certificate`: auto-fills attendance confirmation
     - For `session_record`: pre-fills empty ( clinical note is separate)
   - For reports: pre-fill with notes from sessions up to this appointment

3. **Preserve `from` parameter**:
   - `?from=/agenda` or `?from=/patients/[id]`
   - After save, redirect back to originating page
   - Back button uses `from` if present

**Success Criteria:**
- User creates document from appointment in 2 clicks
- Contexto do atendimento preenchido automaticamente
- Navegação de volta funciona intuitivamente

---

## Wave 3: Pre-fill Contextual (Day 2)

### Plan 40-03: Smart Pre-fill by Appointment

**Objective:** Relatórios e laudos preenchem com notas do período correto, não todo histórico.

**Tasks:**
1. **Refactor `DocumentPreFillContext`**:
   - If `appointmentId` provided, fetch appointment date
   - For `patient_record_summary`: include only clinical notes from sessions UP TO that appointment date
   - For other reports: use same logic
   - Count sessions up to appointment date (not total sessions)

2. **Template updates**:
   - `attendance_certificate`: pre-fill with single appointment data
   - `patient_record_summary`: pre-fill with contextual history

**Success Criteria:**
- Relatório de acompanhamento descreve período correto
- Declaração de comparecimento menciona data/hora exatas do atendimento

---

## Verification Plan

- [ ] Create document from appointment page → has correct appointmentId
- [ ] Create `attendance_certificate` without appointment → fails with clear error
- [ ] `patient_record_summary` linked to appointment only includes prior sessions
- [ ] Redirect `from` works from agenda and from patient page
- [ ] Cross-workspace appointment linking is blocked

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Appointment deleted after document created | `appointmentId` is nullable and soft-delete-safe; document keeps ID even if appointment archived |
| Pre-fill com muitas sessões lento | Limitar a últimas 20 sessões; cursor pagination |

---

*Phase: 40-integracao-atendimentos*
*Plan created: 2026-04-25*
