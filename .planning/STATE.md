---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Launch continuation
status: planning
stopped_at: Completed 24-03-PLAN.md
last_updated: "2026-04-03T17:55:41.807Z"
last_activity: 2026-04-02 — Phase 23 complete
progress:
  total_phases: 19
  completed_phases: 10
  total_plans: 33
  completed_plans: 30
  percent: 45
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-26 after v2.0 milestone defined)

**Core value:** PsiVault é o cofre digital da prática psicanalítica — um ambiente seguro, elegante e estruturado para o clínico que leva a sério o registro, a continuidade e a preservação do trabalho analítico.
**Current focus:** v2.0 — Reposicionamento Psicanalítico (roadmap defined, ready to plan)

**Note:** v1.2 technical milestone (phases 07–20) continues independently in parallel.

## Current Position

Phase: 25 — Plano Premium (UI/conceito) ✅ complete
Plan: 25-02 complete
Status: Phase 25 done — ready for Verification
Last activity: 2026-04-03 — Plan 25-02 complete

Progress: [██████████] 100% (5/5 v2.0 phases)

## v2.0 Roadmap Summary

| Phase | Goal | Requirements |
|-------|------|--------------|
| 21 - Brand Foundation | Posicionamento psicanalítico e tokens visuais como ground truth | BRAND-01, BRAND-02 |
| 22 - Landing Page | Landing page com hero, módulos, trust e FAQ para nicho psicanalítico | LAND-01, LAND-02, LAND-03, LAND-04 |
| 23 - Copy Interna | Navegação, dashboard e onboarding com vocabulário e tom de marca | NAV-01, NAV-02, NAV-03 |
| 24 - Continuidade e Fluxo | Prontuário, hierarquia e empty states comunicando acompanhamento | CONT-01, CONT-02, CONT-03, CONT-04 |
| 25 - Plano Premium (UI/conceito) | Assistente de Pesquisa configurável com limites claros | PREM-01, PREM-02, PREM-03 |

**Coverage:** 16/16 v2.0 requirements mapped

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Total execution time: —

**By Phase (v1.2 — parallel milestone):**
| Phase | Plans | Status |
|-------|-------|--------|
| 07-infrastructure-foundation | 1/1 | ✓ Complete |
| 08-authentication-workspaces | 1/1 | ✓ Complete |
| 09-patient-agenda-persistence | 1/1 | ✓ Complete |
| 10-clinical-document-persistence | 0/? | Not started |
| 11-finance-ops-persistence | 0/? | Not started |
| 12-authentication-ux | 0/? | Not started |
| 13-ui-ux-polish | 0/? | Not started |
| 14-quality-production-hardening | 0/? | Not started |
| Phase 10-clinical-document-persistence P01 | 5 | 2 tasks | 3 files |
| Phase 10-clinical-document-persistence P03 | 3 | 2 tasks | 11 files |
| Phase 10-clinical-document-persistence P02 | 15 | 2 tasks | 10 files |
| Phase 11-finance-ops-persistence P01 | 357 | 2 tasks | 16 files |
| Phase 11-finance-ops-persistence P02 | 15 | 2 tasks | 4 files |
| Phase 11-finance-ops-persistence P03 | 15 | 2 tasks | 10 files |
| Phase 12-authentication-ux P01 | 8 | 2 tasks | 6 files |
| Phase 12-authentication-ux P04 | 5 | 1 tasks | 1 files |
| Phase 12-authentication-ux P02 | 3 | 2 tasks | 2 files |
| Phase 12-authentication-ux P03 | 12 | 2 tasks | 3 files |
| Phase 13-ui-ux-polish P01 | 8 | 1 tasks | 1 files |
| Phase 13-ui-ux-polish P02 | 2 | 2 tasks | 3 files |
| Phase 13-ui-ux-polish P03 | 12 | 2 tasks | 10 files |
| Phase 13-ui-ux-polish P04 | 10 | 2 tasks | 13 files |
| Phase 14-quality-production-hardening P02 | 5 | 1 tasks | 2 files |
| Phase 14-quality-production-hardening P01 | 2 | 2 tasks | 3 files |
| Phase 14-quality-production-hardening P04 | 2 | 2 tasks | 3 files |
| Phase 14-quality-production-hardening P03 | 3 | 2 tasks | 6 files |
| Phase 14-quality-production-hardening P05 | 20 | 3 tasks | 7 files |
| Phase 14-quality-production-hardening P06 | 15 | 2 tasks | 6 files |
| Phase 21 P02 | 15 | 3 tasks | 3 files |
| Phase 22-landing-page P01 | 5 | 3 tasks | 1 files |
| Phase 23-copy-interna P01 | 525606 | 2 tasks | 4 files |
| Phase 24-continuidade-e-fluxo P02 | 8 | 2 tasks | 3 files |
| Phase 24-continuidade-e-fluxo P03 | 5 | 1 tasks | 1 files |

## Accumulated Context

### Decisions

- [INIT-01]: Product is a web-first SaaS MVP for solo Brazilian psychologists, not a generic clinic ERP.
- [INIT-02]: v1 includes the full office loop: patient -> schedule -> session record -> document -> payment state.
- [INIT-03]: Security posture is strong from day one: MFA, auditability, backup/export, and strict sensitive-data handling are foundational.
- [INIT-04]: Communication remains assistive and outbound-contextual; no chat/inbox in v1.
- [INIT-05]: Multi-user clinic management, built-in telehealth, and AI clinical writing are deferred beyond v1.
- [INIT-06]: Roadmap order follows operational dependency: foundation -> patient/agenda -> clinical -> documents -> finance/ops -> retrieval/polish.
- [v2.0-01]: v2.0 targets psychoanalytic orientation specifically — generalist framing is an anti-goal. Phase 21 establishes brand ground truth before any UI changes.
- [v2.0-02]: Premium AI assistant is UI/concept only in v2.0 — functional Claude API integration deferred to v3.0.
- [v2.0-03]: Copyright rule is hard: full-text only for public domain, licensed, or user-uploaded material; otherwise metadata + citation + excerpt + legal access path.
- [v2.0-04]: All five v2.0 phases depend on Phase 21 (brand foundation) completing first — it defines vocabulary and visual tokens consumed by all other phases.
- [01-01-01]: TOTP is the first mandatory MFA factor so Phase 1 enforces MFA now without blocking future passkey expansion.
- [01-01-02]: Workspace ownership is explicit in schema and code so later domains inherit a stable account boundary.
- [01-01-03]: Vault access policy stays centralized: sign-in, verify-email, then MFA setup before protected routes.
- [01-02-01]: Setup readiness must stay reusable outside the UI, with required and optional steps exposed from one contract.
- [01-02-02]: Signature assets remain optional for vault readiness but must already exist as a reusable profile/storage contract.
- [01-02-03]: Professional profile persistence should be explicit in server actions and services without forcing build-time database reads.
- [Phase 01-vault-foundation]: Audit storage remains behind a repository abstraction in Phase 1 so later phases can add durable persistence without changing the event contract.
- [Phase 01-vault-foundation]: Security settings surfaces should stay human-readable and calm, using friendly session labels instead of forensic wording.
- [Phase 01-vault-foundation]: Sensitive actions use a 10-minute re-auth window plus explicit confirmation text before completion.
- [Phase 02-patient-and-agenda-core]: Patient soft archive uses explicit archivedAt + archivedByAccountId fields rather than a status enum for unambiguous reversibility.
- [Phase 02-patient-and-agenda-core]: PatientOperationalSummary defaults session fields to null (not empty strings) so the contract stays honest before the scheduling domain hydrates it.
- [Phase 02-patient-and-agenda-core]: importantObservations is profile-only by design — excluded from all list and agenda surfaces to enforce Phase 1 privacy baseline.
- [Phase 02-02]: HYBRID care mode excluded from appointment booking — only IN_PERSON and ONLINE are valid per-occurrence values to prevent ambiguous care-mode data.
- [Phase 02-02]: Rescheduling creates a new occurrence linked via rescheduledFromId — original row stays immutable to preserve visible history and audit trail.
- [Phase 02-02]: Weekly series materialized as concrete rows at creation time so agenda queries are simple date-range scans, not rule expansions at render time.
- [Phase 02-02]: Finalized occurrences (COMPLETED/CANCELED/NO_SHOW) are never overwritten by series edits — they represent completed clinical facts.
- [Phase 02-03]: AgendaCard uses Intl.DateTimeFormat with UTC midnight day anchors so appointments are bucketed into correct local calendar day
- [Phase 02-03]: quick next-session defaults never include date/time — professional must choose slot intentionally to avoid silent scheduling assumptions
- [Phase 02-03]: derivePatientSummaryFromAppointments uses AppointmentForSummary structural subset to avoid circular dependency between patient and appointment domains
- [Phase 02-03]: pendingItemsCount counts future SCHEDULED appointments (actionable scheduling pendency needing confirmation)
- [Phase 02-04]: priceInCents URL param reserved but not forwarded to AppointmentForm — finance domain arrives in Phase 5
- [Phase 02-04]: nextSessionActions map built server-side in agenda/page.tsx keeping view components presentational and free of data-fetching concerns
- [Phase 03-clinical-record-core]: ClinicalNote structured fields default to null (not empty strings) so the contract stays honest when not filled
- [Phase 03-clinical-record-core]: deriveSessionNumber counts only COMPLETED appointments — CANCELED and NO_SHOW are excluded from session numbering
- [Phase 03-clinical-record-core]: Audit metadata restricted to appointmentId only (SECU-05) — clinical content never leaks into audit or log surfaces
- [Phase 03-clinical-record-core]: editedAt is null on creation and set to now on every updateClinicalNote call, distinguishing pristine from edited notes
- [Phase 03-02]: Server actions passed as props to NoteComposerForm client component keeping action file collocated with route
- [Phase 03-02]: nullCoerce helper converts blank FormData strings to null for structured clinical fields (SECU-05)
- [Phase 03-02]: Note entry points merged into nextSessionActions React.Fragment to avoid touching view component signatures
- [Phase 03-03]: ClinicalTimeline is a pure presentational server component — all data loaded in the page and passed as props to keep data-fetching concerns in one place
- [Phase 03-03]: notesByAppointment map built server-side in patient profile page for O(1) note lookup per appointment without N+1 repository calls
- [Phase 04-document-vault]: Receipt template uses R$ ________ placeholder — Phase 5 finance domain will enrich with real payment data
- [Phase 04-document-vault]: createdByName is a snapshot field frozen at document creation time — professional name changes do not retroactively affect documents
- [Phase 05-01]: ChargeStatus uses Portuguese literals (pendente/pago/atrasado) to match domain language and avoid translation at the UI layer
- [Phase 05-01]: updateAppointmentOnlineCare is a dedicated function separate from a generic update — keeps ONLINE care concern isolated and testable
- [Phase 05-01]: remoteIssueNote guard enforced at model layer (throws Error) not server-action layer — correctness closest to data
- [Phase 05-01]: Charge audit metadata whitelist: only chargeId, appointmentId, and newStatus included — never amountInCents or paymentMethod (SECU-05)
- [Phase 05-02]: revalidatePath imported from next/cache not next/navigation — server action cache invalidation uses the cache module
- [Phase 05-02]: listActive + listArchived used to aggregate all patients for monthly /financeiro view — avoids adding listAll to PatientRepository interface
- [Phase 05-02]: Vault layout created from scratch — no (vault)/layout.tsx existed; new file wraps all vault routes with shared navigation
- [Phase 05-03]: ONLINE care fields rendered for all appointment statuses so professionals can update meeting links post-session
- [Phase 05-03]: appointment.updated added to AppointmentAuditEventType union to support meetingLink/remoteIssueNote server actions
- [Phase 05-03]: Comunicacao section rendered for ALL appointment statuses (COMM-01/COMM-02) per domain spec
- [Phase 06-retrieval-recovery-and-launch-polish]: createReminderAuditEvent accepts flat input (eventType, reminderId, workspaceId, accountId, now) — simpler API than charge audit, no nested object needed
- [Phase 06-retrieval-recovery-and-launch-polish]: Wave 0 scaffold tests reference actual future import paths (no mocks) so downstream plan executors have exact contracts to implement against
- [Phase 06-retrieval-recovery-and-launch-polish]: listByWorkspaceAndMonth uses UTC boundaries matching listByMonth pattern (createdAt-based, Date.UTC, exclusive upper bound)
- [Phase 06-retrieval-recovery-and-launch-polish]: Re-auth gate for export/backup uses short-lived cookies (v1 stub) - marked for production replacement with evaluateSensitiveAction
- [Phase 06-retrieval-recovery-and-launch-polish]: VerifyBackupForm uses FileReader API for client-side schema validation - no server round-trip, validateBackupSchema is pure
- [Phase 06-retrieval-recovery-and-launch-polish]: All financial fields included in export - backup is trusted vault operation, SECU-05 whitelist does not apply to owner backup surface
- [Phase 06-retrieval-recovery-and-launch-polish]: searchAll returns flat SearchResultItem[] (not grouped) — Wave 0 test is authoritative over plan interface description; groupSearchResults helper added for UI layer
- [Phase 06-retrieval-recovery-and-launch-polish]: SearchResultItem uses type field (not domain) — matches Wave 0 scaffold contract; clinicalNotes accepted in SearchInput but never indexed (SECU-05)
- [Phase 06-02]: /inicio uses filterTodayAppointments to narrow listByDateRange to UTC day window — no new repo method needed
- [Phase 06-02]: completeReminderAction accepts reminderId string (not FormData) — cleaner .bind(null, id) binding in JSX
- [Phase 06-02]: RemindersSection placed after FinanceSection on patient profile — all operational-status sections grouped before ExportSection
- [Phase 06-05]: Settings layout kept as server component with no usePathname — page heading indicates active section, no client JS needed
- [Phase 06-05]: Tab strip renders above children without adding padding — each settings page owns its own layout padding
- [v1.2-00]: v1.2 "Lançamento" merges remaining v1.1 phases (10–11) with auth UX polish and production hardening into one release milestone.
- [Phase 10-01]: ClinicalNote.appointmentId has @unique — enforces one-to-one at DB level, not application level
- [Phase 10-01]: PracticeDocument.type and .content are plain String (not Prisma enum) — domain DocumentType cast in repository mapToDomain()
- [Phase 10-01]: Migration SQL created manually because DIRECT_URL password is a placeholder — apply with npx prisma migrate deploy after configuring Supabase password
- [Phase Phase 10-03]: PracticeDocumentRepository interface uses Promise<> return types — required for Prisma async implementation, mirrors PatientRepository pattern
- [Phase 10-02]: ClinicalNoteRepository interface updated to async (Promise<T>) — required for Prisma implementation; in-memory implementation also made async to satisfy interface
- [Phase 10-02]: Promise.all() used in UI pages to fetch notes for multiple appointments concurrently — avoids N sequential DB calls
- [Phase Phase 11-01]: Migration SQL created manually (DIRECT_URL is a placeholder) — apply with npx prisma migrate deploy after configuring Supabase password
- [Phase Phase 11-01]: AuditEvent.append() stays sync; only listForWorkspace is async — consistent with append-only immutable audit trail semantics
- [Phase Phase 11-01]: SecuritySettingsPage converted to async Server Component to support await on listForWorkspace
- [Phase Phase 11-02]: findById on SessionCharge uses findUnique by id (PK) — no workspaceId needed at DB level
- [Phase Phase 11-02]: Reminder.link reconstructed from linkType/linkId nullable columns — null check on both before building ReminderLink
- [Phase Phase 11-03]: append() uses void db.auditEvent.create() fire-and-forget to stay sync per interface contract — audit failures never block primary operations (SECU-05)
- [Phase Phase 11-03]: Single __psivaultAudit__ globalThis key replaces 5+ siloed per-domain audit globals, enabling unified audit trail
- [Phase 12-01]: vitest.config.ts necessitou resolve.alias para @/ funcionar em testes — corrigido como blocker (Rule 3)
- [Phase 12-01]: AuthForm usa fieldset disabled ao invés de controlar cada input individualmente — padrão HTML nativo
- [Phase 12-01]: updateSession retorna user do getUser() já executado — evita segundo round-trip de auth no middleware
- [Phase 12-04]: enforceVaultAccess removido — era wrapper com session=null hardcoded; substituído por updateSession Supabase SSR real
- [Phase 12-04]: Parâmetro f em listFactors tipado explicitamente como { status: string } para satisfazer TypeScript strict mode
- [Phase 12-02]: errorMessage exibido no bloco geral apenas quando errorField é null — evita duplicação de mensagem
- [Phase 12-03]: requestPasswordReset sempre redireciona para success — não revela se e-mail existe (prevenção de enumeração)
- [Phase 12-03]: updatePassword valida senhas antes de chamar Supabase — erro de campo retorna field=confirmPassword na URL
- [Phase 12-03]: Token expirado detectado via rawError string — bloco especial com link para solicitar novo
- [Phase 12-03]: code passado via hidden input no update form — server action recebe via FormData.get('code')
- [Phase 13-ui-ux-polish]: Tokens tipograficos com valores exatos: 1.5rem page-title, 0.9375rem body, 0.8125rem meta, 0.75rem label
- [Phase 13-ui-ux-polish]: Breakpoint vault: max-width:767px mobile (bottom-nav), min-width:768px desktop (sidebar)
- [Phase 13-ui-ux-polish]: Avatar iniciais PS hardcoded como placeholder — integracao com sessao Supabase e fase 14
- [Phase 13-ui-ux-polish]: loading.tsx nao usa use client — server component puro, shellStyle replicado do page.tsx para evitar layout shift
- [Phase 13-ui-ux-polish]: EmptyState server component puro sem use client — importável em client e server components
- [Phase 13-ui-ux-polish]: FAB mobile controlado por CSS class .fab-mobile (display:none desktop, flex mobile) — inline styles não suportam media queries
- [Phase 13-ui-ux-polish]: .form-grid CSS class substitui fieldGridStyle inline para colapsar 2 colunas para 1 em mobile (767px)
- [Phase 14-quality-production-hardening]: [14-01-01]: Email de verificação vem exclusivamente de supabase.auth.getUser() — nunca de input do usuário
- [Phase 14-quality-production-hardening]: [14-01-02]: Verificação de timestamp manual removida das routes — cookie Max-Age=600s garante expiração via browser
- [Phase 14-04]: postinstall mantém prisma:generate por compatibilidade — ambos coexistem no package.json
- [Phase 14-04]: Testes com datas hardcoded devem usar datas 2+ anos no futuro para evitar regressão por passagem de tempo
- [Phase 14-quality-production-hardening]: Flag variable pattern (redirectPath/shouldRedirect) used to move redirect() outside try blocks — avoids NEXT_REDIRECT being swallowed by catch
- [Phase 14-quality-production-hardening]: console.error in server actions logs only [actionName] + err object — never clinical, financial, or patient data (SECU-05)
- [Phase 14-quality-production-hardening]: Tipo de retorno explícito Promise<void> em server actions para compatibilidade TypeScript após try/catch
- [Phase 14-quality-production-hardening]: Promise<{ ok: boolean; error?: string } | void> como tipo de retorno une compatibilidade com form action e retorno tipado de erro nos catch blocks
- [Phase 21-brand-foundation]: PsiVault é o nome do produto em toda superfície voltada ao usuário; PsiLock fica restrito ao repositório e ambiente técnico
- [Phase 21-brand-foundation]: Anti-padrões visuais do app interno documentados em subseção própria separada dos da landing, governando o produto inteiro
- [Phase 22-landing-page]: Eyebrow usa 'Para psicólogos de orientação psicanalítica' — posicionamento de nicho explícito desde a primeira linha visível
- [Phase 22-landing-page]: Mockup do hero substituído por tela de prontuário com evoluções cronológicas numeradas — remove agenda de horários que comunicava produto genérico
- [Phase 22-landing-page]: features[0] é Prontuário e evolução clínica — ordem comunica prioridade clínica da ferramenta
- [Phase 23-copy-interna]: Item Prontuário inserido entre Pacientes e Financeiro em ambas as navs — ordem comunica prioridade clínica
- [Phase 23-copy-interna]: Config removido do bottom-nav mobile — Configurações acessível apenas via sidebar desktop
- [Phase 23-copy-interna]: A receber usado para singular e plural do badge de cobranças — reduz peso de jargão financeiro
- [Phase 24-continuidade-e-fluxo]: careMode usado no lugar de serviceMode — plano tinha nome errado, modelo real usa careMode
- [Phase 24-continuidade-e-fluxo]: Funções puras de timeline em arquivo .ts separado do Server Component — testabilidade sem acoplamento à rota
- [Phase 24-continuidade-e-fluxo]: details/summary HTML nativo para seções recolhidas (dismissed, completedHidden) — zero JS adicional
- [Phase 24-continuidade-e-fluxo]: Badge 'Novo acompanhamento' é texto simples itálico sem background — não é chip colorido (anti-padrão visual do produto)

### Pending Todos

- Plan and execute Phase 21 (Brand Foundation) — first v2.0 phase.
- Plan and execute Phase 22 (Landing Page).
- ~~Plan and execute Phase 23 (Copy Interna).~~
- ~~Plan and execute Phase 24 (Continuidade e Fluxo).~~
- ~~Plan and execute Phase 25 (Plano Premium UI/conceito).~~

### Blockers/Concerns

- `.planning/config.json` carries an unrelated local modification and remains intentionally unstaged.
- `tsconfig.tsbuildinfo` is untracked build output and should stay out of future plan commits unless tooling chooses to manage it.

## Session Continuity

Last session: 2026-04-03T18:30:00.000Z
Stopped at: Completed 25-02-PLAN.md
Resume: Verify Phase 25 (Plano Premium UI/conceito) — /gsd:verify-phase 25
