# Phase 37: Foundation & Migration - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a fundação de dados e domain model para o ciclo de vida completo de documentos no PsiVault, com migração 100% segura de documentos existentes (usuários reais em produção). Nenhuma mudança de UI é feita nesta fase — apenas schema, domain, repository, e migration.

Scope: Schema Prisma, domain model com DocumentStatus, repository extension, composite indexes, e migration zero-downtime que preserva todos os documentos existentes.

</domain>

<decisions>
## Implementation Decisions

### Schema Migration Strategy
- **D-01:** Todas as colunas novas são `nullable` com `default` seguro. Nenhuma coluna existente é removida, renomeada, ou alterada para `NOT NULL` sem default.
- **D-02:** Migration Prisma usa SQL raw com `COALESCE` para mapear dados existentes: `archivedAt IS NOT NULL` → `status = 'archived'`; `archivedAt IS NULL` → `status = 'finalized'`.
- **D-03:** Índices compostos novos: `@@index([workspaceId, patientId, status])`, `@@index([workspaceId, patientId, createdAt])`, `@@index([appointmentId])`. Nenhum índice existente é removido.
- **D-04:** Campo `type` permanece como `String` (não converte para enum Prisma) para evitar migration pesada em tabela com dados reais. Validação continua em runtime no domain model.

### Domain Model
- **D-05:** `DocumentStatus` é tipo canônico com valores: `"draft" | "finalized" | "signed" | "delivered" | "archived"`.
- **D-06:** Transições de estado são funções puras: `finalizeDocument`, `signDocument`, `deliverDocument`, `archiveDocument`. Cada uma retorna novo objeto ou erro (nunca muta in-place).
- **D-07:** Guards de transição: `draft` pode ir para `finalized`; `finalized` pode ir para `signed` ou voltar para `draft`; `signed` pode ir para `delivered`; nenhum estado pode ir para `archived` exceto via `archiveDocumentAction` que é soft-delete lógico.
- **D-08:** IDs de documento usam prefixo `doc_` seguindo convenção do projeto (`pat_`, `appt_`, etc.). Gerador consistente de 16 bytes hex.

### Repository Pattern
- **D-09:** Repository extended com métodos novos: `listByStatus`, `listDraftsByPatient`, `findByAppointmentId`, `listActiveByPatientWithStatus`. Todos mantêm workspace scoping.
- **D-10:** Métodos existentes (`listActiveByPatient`, `findById`) continuam funcionando com mapeamento de `status` — não quebram contrato existente.

### Data Safety
- **D-11:** Zero downtime: migration roda em transação, mas sem lock pesado. PostgreSQL `ADD COLUMN` com default é rápido em PostgreSQL 14+.
- **D-12:** Rollback plan: se algo falhar, colunas novas podem ser ignoradas pelo código antigo (são nullable). Não há alteração de contratos existentes.
- **D-13:** Documentos existentes de usuários reais são preservados em 100% dos casos. Teste de migração é obrigatório em CI.

### Security
- **D-14:** Server Actions novas validam `workspaceId` + `accountId` antes de qualquer operação. Nenhuma action recebe `workspaceId` do client — sempre resolve da sessão.
- **D-15:** Cross-patient guard centralizado em função utilitária reutilizável, não replicado em cada action/page.

### Audit
- **D-16:** Novos tipos de audit event: `document.draft_saved`, `document.finalized`, `document.signed`, `document.delivered`. Metadata contém `documentType` e `status` (sem conteúdo clínico, conforme SECU-05).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain & Architecture
- `.planning/REQUIREMENTS.md` — v1.6 requirements MIGR-01 a MIGR-05
- `.planning/PROJECT.md` — Vision, constraints, stack
- `.planning/STATE.md` — Current progress and decisions

### Document Domain (Existing)
- `src/lib/documents/model.ts` — Current DocumentType, PracticeDocument, factories
- `src/lib/documents/repository.ts` — Repository interface
- `src/lib/documents/repository.prisma.ts` — Prisma implementation
- `src/lib/documents/store.ts` — Singleton store
- `src/lib/documents/audit.ts` — Audit events

### Schema
- `prisma/schema.prisma` — Current PracticeDocument model

### Actions (Current, to understand guards)
- `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` — createDocumentAction
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts` — archiveDocumentAction
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts` — updateDocumentAction

### Tests
- `/tests/**/*.test.ts` — Existing document tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createPracticeDocument`, `updatePracticeDocument`, `archivePracticeDocument` factories em `src/lib/documents/model.ts` — podem ser extendidos para `finalizeDocument`, `signDocument`, `deliverDocument`
- `PracticeDocumentRepository` interface em `src/lib/documents/repository.ts` — adicionar métodos novos
- `createDocumentAuditEvent` em `src/lib/documents/audit.ts` — já suporta tipos dinâmicos
- `getDocumentRepository()` singleton em `src/lib/documents/store.ts` — padrão estabelecido

### Established Patterns
- IDs com prefixo: `pat_`, `appt_`, `ws_`, `acct_` — `doc_` segue mesma convenção
- Soft deletes: `deletedAt` + `deletedByAccountId` em Patient; documentos usam `archivedAt` — manter consistência, não renomear
- Timestamps ISO 8601, sufixo `_at` no banco
- Repository pattern: interface → Prisma impl → singleton store
- Server Actions validam workspace + role; nunca chamam Prisma direto

### Integration Points
- Prisma schema migration via `prisma migrate dev`
- Domain model é source of truth para types; Prisma model usa `String` e cast em `mapToDomain()`
- Audit events são emitidos após toda mutation
- `revalidatePath` com escopo `"page"` em Server Actions

</code_context>

<specifics>
## Specific Ideas

- Migration deve ser testada com dados sintéticos que simulam a produção (milhares de documentos, mix de arquivados e ativos)
- `appointmentId` é opcional e não cria foreign key no Prisma schema (relação lógica, não enforceada no DB) para evitar constraints pesadas em migration
- Status default para novos documentos: `"draft"` (mudança de comportamento — hoje nascem como se estivessem prontos)
- Campo `archivedAt` continua existindo; `status = "archived"` é redundante intencional para facilitar queries e manter compatibilidade
</specifics>

<deferred>
## Deferred Ideas

- Conversão de `type` para enum Prisma nativo — pertence a fase de cleanup (Phase 42) quando tiver certeza de que não há dados inválidos
- Remoção de `archivedAt` em favor de `status = "archived"` apenas — Phase 42, quando código legado for removido
- Full-text search em metadados de documentos — v2

</deferred>

---

*Phase: 37-foundation-and-migration*
*Context gathered: 2026-04-25*
