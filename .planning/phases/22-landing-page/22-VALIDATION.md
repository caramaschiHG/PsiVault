---
phase: 22
slug: landing-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (node env, globals) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm tsc --noEmit` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm tsc --noEmit` (TypeScript válido — sem erros de sintaxe)
- **After every plan wave:** Run `pnpm test` (suite existente não deve regredir)
- **Before `/gsd:verify-work`:** `pnpm build` green + inspeção visual da landing no browser
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | LAND-01 | manual | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 22-01-02 | 01 | 1 | LAND-01 | manual | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 22-01-03 | 01 | 1 | LAND-02 | manual | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 22-02-01 | 02 | 2 | LAND-03 | manual | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 22-02-02 | 02 | 2 | LAND-04 | manual | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 22-02-03 | 02 | 2 | LAND-01, LAND-02, LAND-03, LAND-04 | manual | `pnpm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing infrastructure covers all phase requirements.

*Esta fase é exclusivamente reescrita de copy estático inline em JSX. Nenhuma infraestrutura nova é necessária.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Eyebrow hero contém "psicanalítica" explicitamente | LAND-01 | Copy estático, sem lógica — inspeção de texto | Abrir `landing-page.tsx`, verificar `<p className={styles.eyebrow}>` |
| H1 usa vocabulário de nicho (prontuário/escuta/continuidade/sigilo) | LAND-01 | Copy estático | Ler H1 e lead paragraph no componente |
| Features: Prontuário é o primeiro item no array | LAND-02 | Ordem de array inline | Verificar `features[0].title` começa com "Prontuário" |
| Features: 5 módulos com framing de prática analítica | LAND-02 | Copy semântico | Ler titles e copies dos 5 primeiros features |
| Trust points cobrem sigilo, acesso, continuidade, exportação | LAND-03 | Copy semântico | Ler os 4 objetos do `trustPoints` array |
| Trust points sem promessas legais vagas (CFP, LGPD, 100% seguro) | LAND-03 | Anti-padrão de tom | Grep por "CFP", "LGPD", "conformidade", "garantida" no componente |
| FAQ cobre dados/propriedade, offline, exportação, cancelamento, ética | LAND-04 | Copy semântico | Ler todos os objetos do `faqs` array |
| FAQ são perguntas de pré-compra (não de suporte pós-assinatura) | LAND-04 | Anti-padrão de tom | Cada pergunta deve ser uma objeção de compra |
| Mockup do hero mostra prontuário com evoluções (não agenda) | LAND-01 | JSX visual | Inspecionar `workspaceMain` JSX — sem referência a horários/agenda |
| Nenhum anti-padrão de tom do CLAUDE.md | LAND-01–04 | Regras editoriais | Grep por "revolucione", "potencialize", "transforme", "inteligente" |

---

## Validation Sign-Off

- [ ] Todos os arrays reescritos: `trustPoints`, `pains`, `features`, `securityPoints`, `faqs`
- [ ] Hero JSX substituído: eyebrow, H1, lead, bullets, mockup
- [ ] Seções secundárias revisadas: `brazilRows`, SolutionBoard, WorkflowGrid, final CTA, footer
- [ ] `pnpm tsc --noEmit` passa sem erros
- [ ] `pnpm test` sem regressões
- [ ] `pnpm build` green
- [ ] Inspeção visual no browser: landing renderiza corretamente
- [ ] Nenhum anti-padrão de tom detectado
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
