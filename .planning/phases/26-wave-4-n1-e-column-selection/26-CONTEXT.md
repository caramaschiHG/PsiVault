# Phase 26 — Wave 4: N+1 e Column Selection

## Problem

Two independent performance issues:

**QUERY-04 — N+1 em clinical notes (agenda)**
`agenda/page.tsx` lines 195–207: `Promise.all(completedAppts.map(a => clinicalRepo.findByAppointmentId(a.id, workspaceId)))` — uma query por atendimento completado. O agenda só precisa saber SE existe nota (boolean), não o conteúdo.

**QUERY-05 — importantObservations em listagens**
`listActive()` e `listArchived()` do Prisma repository fazem SELECT * sem omitir `importantObservations`. O schema documenta explicitamente que o campo não deve aparecer em listagens — a restrição existe no comentário mas não é enforced na query.

## Decisions

- **Area 1 (QUERY-04 return type)**: `findByAppointmentIds` retorna `Set<string>` de IDs que têm nota. Zero overhead — agenda só checa presença.
- **Area 2 (QUERY-05 strategy)**: select explícito em `listActive`/`listArchived` omitindo `importantObservations`. Campo mapeado como `null` no domain object. `findById` continua retornando completo.

## Target files

- `src/lib/clinical/repository.ts` — add interface method + in-memory impl
- `src/lib/clinical/repository.prisma.ts` — add Prisma batch impl
- `src/app/(vault)/agenda/page.tsx` — replace N+1 with batch call
- `src/lib/patients/repository.prisma.ts` — add LIST_SELECT + mapListToDomain, use in list methods

## Expected outcome

- N atendimentos completados na agenda → 1 query (não N)
- `importantObservations` nunca trafega em listagens (SELECT exclui o campo no SQL)
- 407 testes passam, comportamento visual sem regressão
