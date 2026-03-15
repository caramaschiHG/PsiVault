---
phase: 06-retrieval-recovery-and-launch-polish
plan: 03
subsystem: ui
tags: [search, server-action, react, client-component, debounce, secu-05, srch-01, srch-02]

# Dependency graph
requires:
  - phase: 06-01
    provides: Wave 0 scaffold test (tests/search-domain.test.ts) with exact searchAll contract
  - phase: 05-finance-and-assisted-operations
    provides: vault layout.tsx, patient/appointment/document/finance stores and repositories
  - phase: 04-document-vault
    provides: PracticeDocument model and repository
  - phase: 03-clinical-record-core
    provides: ClinicalNote model (included in SearchInput for API compatibility, not indexed)
provides:
  - searchAll pure function (flat array, SECU-05 enforced, 16 tests green)
  - SearchResultItem type with type/id/label/href/patientName/date fields — no clinical or financial content
  - groupSearchResults helper to convert flat array to grouped SearchResults for dropdown UI
  - searchAllAction "use server" action — aggregates all domain data, delegates to searchAll
  - SearchBar "use client" island — 300ms debounce, grouped dropdown, outside-click dismiss
  - layout.tsx updated with SearchBar island (stays server component)
affects:
  - Any future plan that uses the search module or adds new searchable domains

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure function search with all data as input (no repository calls inside searchAll)
    - Wave 0 test as authoritative contract — test interface overrides plan interface description
    - Flat array return from searchAll with type discriminant field; groupSearchResults converts for UI
    - Server action as data-fetching pattern (not Route Handler) — established from RESEARCH.md
    - Client island inside server layout — Next.js resolves boundary automatically

key-files:
  created:
    - src/lib/search/search.ts
    - src/app/(vault)/actions/search.ts
    - src/app/(vault)/components/search-bar.tsx
  modified:
    - src/app/(vault)/layout.tsx

key-decisions:
  - "searchAll returns flat SearchResultItem[] (not grouped SearchResults) — Wave 0 test is authoritative over plan interface description"
  - "SearchResultItem uses type field (not domain) — matches Wave 0 scaffold contract from Plan 01"
  - "clinicalNotes accepted in SearchInput for API compatibility but never used as search index (SECU-05)"
  - "groupSearchResults is a separate helper — keeps searchAll pure and test-friendly while giving SearchBar the grouped shape it needs"

patterns-established:
  - "searchAll: pure function, all data as input, flat array output, type discriminant, SECU-05 enforced in type"
  - "SearchBar: 300ms debounce via useRef<ReturnType<typeof setTimeout>>, immediate collapse on empty query"
  - "Vault-level client islands live in src/app/(vault)/components/ and are imported by the server layout"

requirements-completed: [SRCH-01, SRCH-02]

# Metrics
duration: 18min
completed: 2026-03-15
---

# Phase 6 Plan 3: Global Search Summary

**Persistent nav search bar with 300ms debounce calling a server action that queries all domains (patients, sessions, documents, charges) and returns grouped dropdown results — SECU-05 enforced, 289 tests green**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-15T03:15:59Z
- **Completed:** 2026-03-15T03:17:49Z
- **Tasks:** 2 of 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments
- Implemented `searchAll` pure function matching the Wave 0 test contract exactly (16/16 tests green)
- SECU-05 enforced: `SearchResultItem` type has no `freeText`, `amountInCents`, `paymentMethod`, or `content` fields
- Created `searchAllAction` server action that aggregates all patients/appointments/documents/charges and delegates to `searchAll`
- Built `SearchBar` client island with 300ms debounce, grouped dropdown (Pacientes/Sessões/Documentos/Cobranças), and outside-click dismiss
- Updated `layout.tsx` to embed `SearchBar` island while remaining a server component — 289/289 tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: searchAll pure function (TDD GREEN)** - `502dd25` (feat)
2. **Task 2: server action + SearchBar + nav integration** - `9ab9db6` (feat)

**Plan metadata:** (docs commit — see below)

_Note: Task 1 was TDD — RED phase confirmed by import failure, GREEN phase confirmed by 16/16 tests passing_

## Files Created/Modified
- `src/lib/search/search.ts` — searchAll pure function, SearchResultItem/SearchResults/SearchInput types, groupSearchResults helper
- `src/app/(vault)/actions/search.ts` — searchAllAction "use server" — aggregates all domain data, returns SearchResultItem[]
- `src/app/(vault)/components/search-bar.tsx` — SearchBar "use client" island with debounce + grouped dropdown + SearchDropdown/ResultGroup sub-components
- `src/app/(vault)/layout.tsx` — imports SearchBar island, stays server component

## Decisions Made
- **Wave 0 test is authoritative over plan interface description:** The plan's `<interfaces>` section described a `domain` field and grouped `SearchResults` return, but the Wave 0 scaffold test (created in Plan 01) uses a `type` field and flat array return. The test defines the contract — implementation follows the test.
- **`clinicalNotes` in `SearchInput`:** Accepted for API compatibility (Wave 0 test passes `clinicalNotes` in DATA), but never used for search indexing. This enforces SECU-05 — clinical content is never searchable.
- **`groupSearchResults` helper:** Added as a named export to keep `searchAll` pure (flat array, easily testable) while giving the dropdown component the grouped format it needs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Implemented flat array API matching Wave 0 test, not the grouped API in plan interfaces**
- **Found during:** Task 1 (reading tests/search-domain.test.ts before implementing)
- **Issue:** Plan's `<interfaces>` section described `SearchResults` grouped object and `domain` field, but the Wave 0 test expects flat `SearchResultItem[]` with `type` field. If implementing the plan's interface, all 16 tests would fail.
- **Fix:** Implemented `searchAll` to return flat `SearchResultItem[]` with `type` field. Added `groupSearchResults` helper for the UI layer. The plan's grouped interface is still served via this helper.
- **Files modified:** `src/lib/search/search.ts`
- **Verification:** 16/16 search-domain.test.ts tests pass
- **Committed in:** `502dd25` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — implementation matched actual test contract vs plan description mismatch)
**Impact on plan:** Auto-fix necessary for test suite to pass. The functional result is equivalent — searchAll still returns all result types with proper SECU-05 enforcement.

## Issues Encountered
None beyond the plan/test interface mismatch documented above.

## Next Phase Readiness
- Plan 06-04 (export/backup): Search is independent; export tests were already green before this plan.
- SearchBar is visible in the nav from every vault route (SRCH-01 satisfied).
- Partial name search returns grouped results within 300ms debounce (SRCH-02 satisfied).
- SearchResultItem type enforces SECU-05 at compile time — no sensitive fields possible.

---
*Phase: 06-retrieval-recovery-and-launch-polish*
*Completed: 2026-03-15*
