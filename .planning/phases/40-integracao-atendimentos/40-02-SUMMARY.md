---
phase: 40-integracao-atendimentos
plan: 02
subsystem: documents + agenda
---

# Phase 40 Plan 02: Integração com Atendimentos — Wave 2 Summary

Exibir o vínculo com atendimento nos documentos e permitir criação rápida de documento diretamente da agenda.

## What Was Built

### 1. Appointment badge in DocumentTimeline
- `DocumentTimeline` recebe prop opcional `appointments` (mapa de id → `{ startsAt, careMode }`)
- `AppointmentBadge` component renderiza:
  - "Atendimento de {date}, {time}" como `Link` para `/agenda` quando o appointment existe
  - "Atendimento removido" em cor neutra quando não existe
- Badge posicionado ao lado do `StatusBadge`, separado por `·`
- Estilo discreto: 0.72rem, sem background, cor text-3

### 2. Appointment meta-info in document view page
- Página de visualização busca appointment vinculado via `findById(doc.appointmentId, workspaceId)`
- Meta-info renderizada **entre breadcrumb e `DocumentPaperScaler`** (não aparece no PDF)
- Mostra data/hora formatada + modalidade (Presencial/Online)
- Quando appointment removido: "Atendimento removido" em itálico, cor apagada

### 3. Quick actions in agenda for COMPLETED appointments
- Dois novos links no card de atendimentos COMPLETED:
  - "Criar declaração" (primário, background accent) → `documents/new?type=declaration_of_attendance`
  - "Criar nota" (secundário, outline) → `documents/new?type=session_record`
- Ambos incluem `appointmentId` e `from=/agenda` nos query params

### 4. Prop chain: page → DocumentTimeline
- `page.tsx` (paciente): cria `appointmentMap` a partir de `appointments` já buscados e passa para `PatientProfileTabs`
- `PatientProfileTabs`: recebe e repassa `appointmentMap` para `PatientDocumentosTab`
- `PatientDocumentosTab`: repassa para `DocumentsSection`
- `DocumentsSection`: repassa como `appointments` para `DocumentTimeline`

## Key Decisions

- **Appointment data via prop chain** (Server Component → Client Component) em vez de fetch no client — evita waterfall, mantém dados já filtrados por workspace
- **Badge discreto** — não compete visualmente com o StatusBadge; sem background, fonte pequena
- **Meta-info fora do DocumentPaperScaler** — garante que não apareça no PDF gerado
- **Links hardcoded na agenda** — `patientId` e `appt.id` vêm do próprio loop, sem input do usuário

## Files Changed

| File | Change |
|------|--------|
| `src/app/(vault)/patients/[patientId]/components/document-timeline.tsx` | Adiciona prop `appointments`, componente `AppointmentBadge`, renderiza ao lado do status |
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` | Busca appointment vinculado, renderiza meta-info acima do A4 |
| `src/app/(vault)/agenda/page.tsx` | Adiciona "Criar declaração" e "Criar nota" em atendimentos COMPLETED |
| `src/app/(vault)/patients/[patientId]/page.tsx` | Cria `appointmentMap` e passa para `PatientProfileTabs` |
| `src/app/(vault)/patients/[patientId]/components/patient-profile-tabs.tsx` | Recebe e repassa `appointmentMap` |
| `src/app/(vault)/patients/[patientId]/components/patient-documentos-tab.tsx` | Recebe e repassa `appointmentMap` |
| `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` | Recebe e repassa `appointmentMap` como `appointments` |

## Verification

- `pnpm test`: 453 passing
- `pnpm build`: compiled successfully, zero TypeScript errors
- Timeline mostra badge de atendimento para documentos vinculados
- View page mostra meta-info acima do papel A4
- Agenda mostra "Criar declaração" em atendimentos completed

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — all mitigations from threat model (T-40-07, T-40-08, T-40-09) were preserved.

## Self-Check: PASSED

- [x] All modified files exist and compile
- [x] All commits exist (4d3832b, a1dbc97, 7c51d46)
- [x] No accidental file deletions
- [x] Tests pass (453/453)
- [x] Build passes
