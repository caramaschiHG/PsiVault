# Phase 40: integracao-atendimentos - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Documentos nascem do contexto clínico correto. Ligação opcional appointment-document, criação de documento a partir de atendimento, pre-fill contextual com dados da sessão, fluxo contínuo sessão→nota→documento.

Escopo fixo (ROADMAP.md):
- Documento pode ter `appointmentId` opcional; quando preenchido, exibe contexto da sessão na visualização
- Criar documento a partir da página de atendimento preenche automaticamente data, hora, tipo de atendimento
- Declaração de comparecimento nasce diretamente de um atendimento específico
- Relatório de acompanhamento preenche com notas clínicas do período correto (últimas N sessões), não todas as notas do paciente
- Fluxo sessão→nota→documento preserva contexto e parâmetro `from` para navegação de volta

</domain>

<decisions>
## Implementation Decisions

### Exibição do vínculo com atendimento

- **D-01:** Na timeline de documentos do paciente, documentos vinculados a um atendimento exibem um **badge discreto com data/hora do atendimento** (ex: "Atendimento de 25/04/2026, 14:00") posicionado como tag secundária ao lado do tipo do documento. Mantém a lista limpa e escaneável.
- **D-02:** O badge de atendimento é **clicável** e leva para `/agenda` filtrada pelo paciente na data do atendimento, permitindo rever o contexto da sessão.
- **D-03:** Na visualização digital A4 do documento, o vínculo com o atendimento aparece **acima do papel simulado, fora da área A4**, como meta-informação da página. Não interfere no layout do documento formal.
- **D-04:** O vínculo com atendimento **não aparece no PDF gerado**. Documentos formais mantêm formato tradicional sem referência ao atendimento. A informação é apenas para uso interno/contexto clínico.
- **D-05:** Se o atendimento vinculado for excluído posteriormente, o `appointmentId` é **preservado no banco de dados**, mas a UI exibe "Atendimento removido" em cor neutra (cinza). O documento permanece funcional e acessível.

### Navegação de volta (parâmetro `from`)

- **D-06:** Após salvar um documento criado a partir da agenda (ou de qualquer outra origem), o redirecionamento padrão é para a **página do paciente, aba Documentos** (`/patients/[patientId]?tab=documentos`). Centraliza o retorno no prontuário do paciente.
- **D-07:** O botão "Voltar" durante a edição do documento **respeita o parâmetro `from`** passado na URL. Se `from=/agenda`, volta para a agenda; se `from=/patients/[id]`, volta para o paciente.
- **D-08:** Quando o parâmetro `from` está ausente (ex: deep link copiado, bookmark, refresh), o fallback de navegação é a **página do paciente, aba Documentos**.

### Claude's Discretion

- Ponto de partida do fluxo (de onde na agenda/paciente o usuário inicia criação de documento vinculado) — implementar padrão consistente com `CompletedAppointmentNextSessionAction` (query params)
- Pre-fill específico por tipo de documento ao criar a partir de atendimento — seguir lógica existente em `buildDocumentContent` e estender `DocumentPreFillContext`
- Quantidade de sessões no passado a considerar para pre-fill de relatórios (APPT-04) — padrão de 20 sessões ou todo histórico até a data do atendimento, o que for menor
- Exatidão do filtro da agenda ao clicar no badge (dia exato vs semana) — usar o padrão de navegação já existente

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` §Phase 40 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §APPT-01 a APPT-05 — Requisitos da integração com atendimentos

### Existing plan
- `.planning/phases/40-integracao-atendimentos/40-PLAN.md` — Plano preliminar com 3 ondas (Appointment Linkage Core, Session→Document Quick Flow, Smart Pre-fill)

### Domain models
- `src/lib/documents/model.ts` — `PracticeDocument` com `appointmentId`, `DocumentStatus`, funções de transição
- `src/lib/appointments/model.ts` — `Appointment` com `startsAt`, `endsAt`, `careMode`, `status`
- `src/lib/documents/templates.ts` — `DocumentPreFillContext`, `buildDocumentContent`, templates por tipo

### Repositories
- `src/lib/documents/repository.ts` — Contrato com `findByAppointmentId`
- `src/lib/documents/repository.prisma.ts` — Implementação Prisma

### UI existente
- `src/app/(vault)/patients/[patientId]/components/document-timeline.tsx` — Timeline com badges de status e filtros
- `src/app/(vault)/patients/[patientId]/documents/new/page.tsx` — Composer page com pre-fill context assembly
- `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx` — Form com auto-save server-side
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` — View page com A4 paper layout
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/components/document-actions.tsx` — Actions com sign/archive/PDF
- `src/app/(vault)/agenda/components/appointment-card.tsx` — Card de atendimento com quick actions
- `src/app/(vault)/agenda/components/completed-appointment-next-session-action.tsx` — Padrão de query params para fluxo contínuo

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DocumentTimeline` — timeline cronológica com filtros por status; adicionar badge de atendimento aqui
- `DocumentComposerForm` — editor unificado com auto-save server-side; aceitar `appointmentId` opcional via prop/hidden field
- `DocumentPaperView` + `DocumentPaperScaler` — layout A4 simulado; badge de atendimento pode ser renderizado acima do scaler
- `CompletedAppointmentNextSessionAction` — padrão de passar contexto via query params (`?patientId=&appointmentId=&from=`)
- `AppointmentCard` — cards na agenda com quick actions; pode receber novo quick action "Criar documento"

### Established Patterns
- Query params para estado de navegação (`from`, `type`, `appointmentId`)
- Server Components para páginas de documento (composer, view) com data fetching
- Client Components para interatividade (timeline filters, form auto-save, actions)
- Breadcrumbs manuais com `Link` + separador `›`
- `useTransition` + `useToast` para Server Actions em Client Components

### Integration Points
- `createDocumentAction` em `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` — aceitar `appointmentId` no FormData
- `buildDocumentContent` — estender `DocumentPreFillContext` com dados do atendimento vinculado
- Rota `/patients/[patientId]/documents/new` — ler `appointmentId` de searchParams e buscar atendimento para validação/pre-fill
- Rota `/patients/[patientId]/documents/[documentId]` — buscar atendimento vinculado para exibir badge
- Agenda `/agenda` — adicionar quick action em atendimentos `COMPLETED` para criar documento

</code_context>

<specifics>
## Specific Ideas

- Badge de atendimento na timeline deve ser discreto — não competir visualmente com o badge de status (draft/finalized/signed). Sugestão: cor neutra (text-3), fonte 0.72rem, sem background colorido.
- Link do badge deve levar para `/agenda` com o dia do atendimento em foco. Se a agenda não suportar deep-link por dia ainda, fallback para `/agenda` geral.
- "Atendimento removido" deve usar a mesma tipografia do badge normal, mas com cor `text-4` (mais apagada) e sem link.

</specifics>

<deferred>
## Deferred Ideas

- Dashboard global `/documentos` com filtros — Fase 41
- Full-text search em metadados de documentos — v2 (fora do escopo v1.6)
- Exportação em lote de documentos filtrados — v2 (fora do escopo v1.6)

</deferred>

---

*Phase: 40-integracao-atendimentos*
*Context gathered: 2026-04-25*
