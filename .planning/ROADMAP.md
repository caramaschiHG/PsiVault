# Execution Roadmap: PsiVault Launch Scope

**Active milestone:** `v1.2 Lançamento`
**Current unarchived launch scope:** phases `07`–`20`
**Current planning focus:** Phase 15: Planning Metadata Realignment

The roadmap below keeps the original v1.1 and v1.2 phase history, but the live launch scope is the combined unarchived sequence from infrastructure through launch sign-off.

## Archived foundation carried into the active launch scope

## Phase 7: Infrastructure Foundation
**Goal:** Establish the production database and ORM layer connected to Supabase.
**Requirements:** INFRA-01, INFRA-02, INFRA-03

**Plans:** 2 plans

Plans:
- [ ] 07-01-PLAN.md — Provisionar Supabase e preencher .env com credenciais reais (checkpoint humano)
- [ ] 07-02-PLAN.md — Aplicar migrações Prisma ao banco real e verificar conectividade (smoke test)

**Success Criteria:**
1. Supabase project is provisioned and connection strings are in local `.env`
2. `schema.prisma` is fully defined and successfully migrated to the Supabase database
3. Prisma client can connect via Supavisor pool without exhaustion in test scripts

---

## Phase 8: Authentication & Workspaces
**Goal:** Replace the v1.0 auth stub with real Supabase authentication.
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04

**Success Criteria:**
1. Users can sign up and sign in using email/password via Supabase Auth
2. `middleware.ts` correctly reads and refreshes the Supabase session cookie
3. Protected routes correctly redirect unauthenticated users to the sign-in page
4. The authenticated user ID maps correctly to a persistent `Workspace` and `Account` in the database

---

## Phase 9: Patient & Agenda Persistence
**Goal:** Replace in-memory patient and agenda repositories with Prisma implementations.
**Requirements:** REPO-01, REPO-02

**Success Criteria:**
1. `PrismaPatientRepository` implements all methods of `PatientRepository`
2. `PrismaAgendaRepository` implements all methods of `AgendaRepository`
3. Creating, editing, and listing patients and appointments persists across server restarts
4. All existing Patient and Agenda domain tests pass against the new Prisma implementations

---

## Phase 10: Clinical & Document Persistence
**Goal:** Replace in-memory clinical and document repositories with Prisma implementations.
**Requirements:** REPO-03, REPO-04

**Plans:** 3/3 plans complete

Plans:
- [ ] 10-01-PLAN.md — Extend schema.prisma with ClinicalNote + PracticeDocument models and run migration
- [ ] 10-02-PLAN.md — Implement PrismaClinicalRepository and swap clinical store.ts
- [ ] 10-03-PLAN.md — Implement PrismaDocumentRepository and swap document store.ts

**Success Criteria:**
1. `PrismaClinicalRepository` implements all methods of `ClinicalRepository`
2. `PrismaDocumentRepository` implements all methods of `DocumentRepository`
3. Clinical notes and generated documents persist across server restarts
4. All existing Clinical and Document domain tests pass against the new Prisma implementations

---

## Phase 11: Finance & Ops Persistence
**Goal:** Replace in-memory finance and audit repositories with Prisma implementations.
**Requirements:** REPO-05, REPO-06

**Plans:** 3/3 plans complete

Plans:
- [ ] 11-01-PLAN.md — Extend schema.prisma with SessionCharge, AuditEvent, Reminder models; migrate interfaces to async
- [ ] 11-02-PLAN.md — Implement PrismaFinanceRepository and PrismaReminderRepository; swap store.ts files
- [ ] 11-03-PLAN.md — Implement PrismaAuditRepository; create centralized audit store; consolidate action file stubs; wire backup route

**Success Criteria:**
1. `PrismaFinanceRepository` implements all methods of `FinanceRepository`
2. `PrismaAuditRepository` implements all methods of `AuditRepository`
3. Financial charges and audit events persist across server restarts
4. All existing Finance and Audit domain tests pass against the new Prisma implementations
5. The application is fully functional end-to-end without any in-memory state leakage

---

## v1.2 Launch continuation

## Phase 12: Authentication UX
**Goal:** Replace stub/minimal auth pages with a professional, user-friendly authentication experience using Supabase Auth.
**Requirements:** AUTHUX-01, AUTHUX-02, AUTHUX-03, AUTHUX-04, AUTHUX-05

**Plans:** 4/4 plans complete

Plans:
- [ ] 12-01-PLAN.md — Fundamentos: auth-errors.ts, SubmitButton, updateSession com user
- [ ] 12-02-PLAN.md — Sign-in e sign-up com erros inline, erros por campo, SubmitButton
- [ ] 12-03-PLAN.md — Reset-password dual-state + server actions requestPasswordReset/updatePassword
- [ ] 12-04-PLAN.md — Middleware AUTHUX-05: redirect de autenticados em rotas de auth

**Success Criteria:**
1. A polished sign-in page with email/password form, validation, and Portuguese error messages is live at `/login`
2. A sign-up page guides new users through account creation with clear feedback
3. A password reset flow allows users to request a reset email and set a new password
4. Authenticated users visiting `/login` or `/signup` are redirected to `/inicio`
5. Supabase Auth errors are caught and displayed as human-readable Portuguese messages

---

## Phase 13: UI/UX Polish
**Goal:** Apply a professional, consistent design system across all views so the product feels production-ready.
**Requirements:** UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06

**Plans:** 4/4 plans complete

Plans:
- [ ] 13-01-PLAN.md — Tokens tipográficos, espaçamento, skeleton-pulse e classes responsivas em globals.css
- [ ] 13-02-PLAN.md — Sidebar dark redesign, BottomNav mobile, atualização de layout.tsx
- [ ] 13-03-PLAN.md — loading.tsx e error.tsx para 5 rotas vault (inicio, agenda, patients, patients/[patientId], financeiro)
- [ ] 13-04-PLAN.md — EmptyState component e polish visual das 5 views primárias + checkpoint de verificação

**Success Criteria:**
1. A design system document (tokens: typography, color, spacing, radius) is defined and applied consistently across all pages
2. All primary views (inicio, agenda, patients list, patient profile, financeiro) have professional, polished layouts
3. All pages are fully responsive and usable on mobile (375px) through desktop (1440px)
4. All text and interactive elements meet WCAG 2.1 AA color contrast (4.5:1 for body, 3:1 for large/UI elements)
5. Every data-dependent page has defined empty states, loading states, and error states
6. Navigation has clear active-state indicators and smooth, professional transitions

---

## Phase 14: Quality & Production Hardening
**Goal:** Harden the application for real-world use — secure routes, robust error handling, complete audit trail, and verified deployment readiness.
**Requirements:** QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, DEPLOY-01, DEPLOY-02, DEPLOY-03

**Plans:** 6/6 plans complete

Plans:
- [ ] 14-01-PLAN.md — Re-auth gate real: substituir stub por signInWithPassword em confirmBackupAuthAction e exportPatientAuthAction
- [ ] 14-02-PLAN.md — Error boundaries: criar error.tsx em sessions/[appointmentId] e patients/[patientId]/documents
- [ ] 14-03-PLAN.md — Try/catch em todas as server actions de mutação (7 arquivos)
- [ ] 14-04-PLAN.md — Auditoria QUAL-04/05/06 + postinstall para migrations Vercel
- [ ] 14-05-PLAN.md — Build verification, .env.example, e checkpoint de lançamento

**Success Criteria:**
1. The export/backup re-auth gate uses the real `evaluateSensitiveAction` flow (no cookie stub)
2. All route segments have error boundaries preventing white-screen crashes
3. All server actions validate inputs and return typed error responses for Prisma and auth failures
4. Workspace backup includes a real audit trail (no `auditEvents: never[]` stub)
5. SECU-05 audit confirms no sensitive clinical or financial data leaks to search, audit, or dashboard surfaces
6. All domain tests pass against Prisma implementations with zero in-memory repository usage
7. `next build` completes without errors and the app starts cleanly in production mode
8. Production environment variables are documented and configured for Supabase and Next.js

---

## Phase 15: Planning Metadata Realignment
**Goal:** Normalize milestone metadata and phase locations so GSD can audit, plan, and archive the current launch scope consistently.
**Requirements:** —
**Gap Closure:** Closes audit integration gap "Planning metadata -> Milestone completion workflow" and flow "Milestone closure / archive"

**Success Criteria:**
1. The active milestone version is consistent across `PROJECT.md`, `STATE.md`, and `ROADMAP.md`
2. Phase artifacts 07 and 08 are available in the active `.planning/phases/` tree or a documented equivalent recognized by GSD
3. GSD phase discovery and next-phase resolution no longer conflict with roadmap reality
4. The milestone boundary for the current launch scope is documented unambiguously

---

## Phase 16: Infrastructure Verification Closure
**Goal:** Convert Phase 07 infrastructure work from summary-only evidence into verified milestone closure.
**Requirements:** INFRA-01, INFRA-02, INFRA-03
**Gap Closure:** Closes audit requirement gaps `INFRA-01`, `INFRA-02`, `INFRA-03`

**Success Criteria:**
1. Supabase project and local environment configuration are re-verified with current evidence
2. Prisma schema and migration state are verified against the real database state
3. Connection pooling and connectivity checks are captured in compliant validation/verification artifacts
4. Requirements traceability can mark all infrastructure requirements complete with structured evidence

---

## Phase 17: Authentication Verification Closure
**Goal:** Convert Phase 08 authentication implementation from summary-only evidence into verified milestone closure.
**Requirements:** AUTH-01, AUTH-02, AUTH-03
**Gap Closure:** Closes audit requirement gaps `AUTH-01`, `AUTH-02`, `AUTH-03`

**Success Criteria:**
1. Cookie-based Supabase session management is re-verified in the live app
2. `middleware.ts` route protection and session refresh behavior are verified end-to-end
3. Sign-in and sign-up flows are verified against current Supabase Auth behavior
4. Compliant validation/verification artifacts exist for Phase 08 and requirements can be closed structurally

---

## Phase 18: Workspace Identity & Persistence Integrity
**Goal:** Remove hardcoded workspace identity from the live app and verify patient/agenda persistence under authenticated workspace scope.
**Requirements:** AUTH-04, REPO-01, REPO-02
**Gap Closure:** Closes audit requirement gaps `AUTH-04`, `REPO-01`, `REPO-02`; closes integration gap "Supabase Auth -> Workspace-scoped vault data access"; closes flow "Authenticated professional sees only their own workspace data"

**Success Criteria:**
1. Vault routes, server actions, search, backup, and export resolve workspace/account from the authenticated Supabase user instead of `ws_1`
2. Workspace/account binding is enforced consistently across repository entry points
3. Patient and agenda persistence are verified under the real workspace-scoped access model
4. Structured verification artifacts prove end-to-end multi-user-safe behavior for auth plus persistence flows

---

## Phase 19: UI Launch Verification
**Goal:** Produce independent verification for the production UI/UX layer so launch polish requirements are auditable.
**Requirements:** UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06
**Gap Closure:** Closes audit requirement gaps `UIUX-01`–`UIUX-06`; closes flow "UI/UX launch sign-off"

**Success Criteria:**
1. Phase 13 has compliant validation and verification artifacts covering all six UIUX requirements
2. Responsive behavior is verified across mobile and desktop launch breakpoints
3. Accessibility and contrast checks are documented with requirement-level evidence
4. Loading, error, empty-state, and navigation polish are verified on the primary vault surfaces

---

## Phase 20: Production Readiness Sign-off
**Goal:** Close the remaining human-needed runtime and deployment confidence checks before milestone archival.
**Requirements:** DEPLOY-02
**Gap Closure:** Closes audit requirement gap `DEPLOY-02`; closes flow "Production readiness sign-off"

**Success Criteria:**
1. Build and production-start verification are rerun and captured with current evidence
2. Remaining runtime auth/error-boundary checks from Phase 14 are completed or replaced with executable verification
3. Phase 14 verification no longer depends on unresolved human-needed launch gates
4. Requirements traceability can mark `DEPLOY-02` complete with structured supporting evidence

---

## v2.0 Reposicionamento Psicanalítico

## Phases

- [ ] **Phase 21: Brand Foundation** — Documenta o posicionamento psicanalítico e os tokens visuais como ground truth para todas as superfícies do produto
- [ ] **Phase 22: Landing Page** — Reescreve a landing page com hero, módulos, trust e FAQ direcionados ao psicólogo de orientação psicanalítica
- [ ] **Phase 23: Copy Interna** — Alinha navegação, dashboard e onboarding com vocabulário e tom de marca psicanalítico
- [ ] **Phase 24: Continuidade e Fluxo** — Garante que prontuário, hierarquia e empty states comuniquem acompanhamento ao longo do tempo
- [ ] **Phase 25: Plano Premium (UI/conceito)** — Apresenta o Assistente de Pesquisa Psicanalítica com configuração por pensador e limites claros

## Phase Details

### Phase 21: Brand Foundation
**Goal:** O posicionamento psicanalítico e a direção visual estão documentados como referência canônica e aplicados aos tokens globais do produto.
**Depends on:** Nothing (first v2.0 phase)
**Requirements:** BRAND-01, BRAND-02
**Success Criteria** (what must be TRUE):
  1. CLAUDE.md contém vocabulário obrigatório, anti-padrões de tom, regras do plano premium e limites de copyright — qualquer contribuidor pode ler e saber como soar
  2. globals.css define tokens de paleta (off-white, charcoal, sage), escala tipográfica editorial e espaçamento generoso como variáveis CSS nomeadas
  3. As variáveis de cor e tipografia são aplicadas de forma coerente em pelo menos uma superfície de produto (sidebar ou dashboard) — o produto visualmente comunica a marca
**Plans:** 1/2 plans executed

Plans:
- [ ] 21-01-PLAN.md — Adicionar seção "Posicionamento Psicanalítico" ao CLAUDE.md
- [ ] 21-02-PLAN.md — Refinar tokens CSS (globals.css) e aplicar na sidebar

---

### Phase 22: Landing Page
**Goal:** A landing page convence o psicólogo de orientação psicanalítica de que o PsiVault foi feito para sua prática — por meio de copy específica, vocabulário de nicho e ausência de qualquer ruído genérico.
**Depends on:** Phase 21
**Requirements:** LAND-01, LAND-02, LAND-03, LAND-04
**Success Criteria** (what must be TRUE):
  1. O hero identifica explicitamente o nicho psicanalítico, usa vocabulário de prontuário/escuta/continuidade/sigilo, e tem CTA para cadastro — um psicólogo ao ler sabe que é para ele
  2. A seção de módulos apresenta Pacientes, Agenda, Prontuário, Documentos e Financeiro com framing de prática clínica analítica — sem linguagem SaaS genérica
  3. A seção de trust comunica sigilo e preservação de longo prazo com linguagem de responsabilidade operacional — sem promessas legais vagas como "em conformidade com CFP"
  4. O FAQ responde dúvidas reais do psicólogo autônomo de consultório privado (dados, acesso, funcionamento offline, continuidade)
**Plans:** TBD

---

### Phase 23: Copy Interna
**Goal:** Toda a navegação, dashboard e onboarding do produto usam vocabulário e tom de marca psicanalítico — o psicólogo que entra no app sente a mesma coerência que viu na landing.
**Depends on:** Phase 21
**Requirements:** NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Todos os itens da sidebar e navegação estão em pt-BR com vocabulário clínico correto (Prontuário, Agenda, Pacientes, Documentos, Financeiro) — nenhum label em inglês ou SaaS genérico visível
  2. O dashboard exibe labels e métricas de prática clínica (próximas sessões, registros pendentes, documentos recentes) — sem termos de "engajamento", "usuários ativos" ou painéis de analytics genéricos
  3. O onboarding acolhe o clínico com tom calmo e específico, sem jargão de startup ou hype — o psicólogo sente que está entrando em um ambiente feito para seu trabalho
**Plans:** TBD

---

### Phase 24: Continuidade e Fluxo
**Goal:** A experiência do prontuário comunica acompanhamento ao longo do tempo — o psicólogo navega pelo histórico de um paciente e sente a continuidade do trabalho analítico, não uma lista de registros isolados.
**Depends on:** Phase 21
**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. A página do prontuário exibe sessões em ordem cronológica navegável — o psicólogo pode percorrer o histórico sem perder o contexto temporal
  2. O fluxo sessão → registro → documento gerado é percorrível em sequência lógica — o psicólogo nunca precisa sair do contexto de uma sessão para localizar o documento dela
  3. A hierarquia paciente → sessões → registros → documentos é visualmente coerente e orientada em todas as telas relevantes — o usuário sempre sabe onde está na estrutura clínica
  4. Empty states, títulos e mensagens usam linguagem de acompanhamento ("nenhuma sessão registrada ainda", "o histórico deste paciente aparecerá aqui") — nunca de tabelas ou registros isolados
**Plans:** TBD

---

### Phase 25: Plano Premium (UI/conceito)
**Goal:** O Assistente de Pesquisa Psicanalítica existe como conceito tangível no produto — o psicólogo entende o que é, pode configurar seu pensador de preferência, e sabe exatamente o que o assistente faz e não faz.
**Depends on:** Phase 21
**Requirements:** PREM-01, PREM-02, PREM-03
**Success Criteria** (what must be TRUE):
  1. A página de apresentação do assistente descreve com clareza: o que faz (literatura, referências por pensador, bibliografias anotadas) e o que não faz (diagnóstico, conclusões clínicas, distribuição de obras protegidas) — o psicólogo não tem expectativas erradas
  2. O psicólogo pode selecionar seu pensador de preferência e linha psicanalítica nas configurações de perfil (Freud, Lacan, Winnicott, Klein, Bion e outros) — a configuração persiste e seria usada pelo assistente real em v3.0
  3. Todo o copy do plano premium usa linguagem de pesquisa e estudo — sem mencionar "IA revolucionária", sem implicar acesso irrestrito a obras protegidas, sem qualquer tom de gimmick ou hype
**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 21. Brand Foundation | 1/2 | In Progress|  |
| 22. Landing Page | 0/TBD | Not started | - |
| 23. Copy Interna | 0/TBD | Not started | - |
| 24. Continuidade e Fluxo | 0/TBD | Not started | - |
| 25. Plano Premium (UI/conceito) | 0/TBD | Not started | - |
