# Release Plan — PsiVault v1.2 "Lançamento"

## Objetivo

Transformar o MVP funcional em um produto publicável, estável e seguro para psicólogos reais usarem com pacientes reais.

## Escopo

Milestone v1.2: phases 07–20 (infra, auth, persistência, UX, polish, produção)

## Status Atual

- ✅ Build passa limpo
- ✅ 351 testes passando
- ✅ Prisma migrations aplicáveis
- ✅ Supabase Auth integrado
- ✅ Repositórios Prisma implementados
- ✅ Landing page pronta
- ✅ Agenda com time grid, month view, quick create

## Bloqueantes (antes de publicar)

| # | Item | Esforço | Risco |
|---|------|---------|-------|
| 1 | `not-found.tsx` global — 404 customizado | Baixo | Médio — rotas dinâmicas sem fallback |
| 2 | `error.tsx` global — error boundary raiz | Baixo | Médio — crash fatal sem feedback |
| 3 | `/sessions/[appointmentId]` sem page — rota quebrada | Baixo | Alto — link quebrado se acessado direto |
| 4 | Security headers no `vercel.json` | Baixo | Alto — sem CSP, X-Frame-Options |
| 5 | Sanitização de rich text — auditar ou substituir | Médio | Alto — XSS em documentos |
| 6 | `NEXT_PUBLIC_SITE_URL` fallback — localhost em produção | Baixo | Médio — links de email quebrados |
| 7 | Metadata title com branding (`%s \| PsiVault`) | Baixo | Baixo — abas sem identidade |

## Alta Prioridade (pós-bloqueantes)

| # | Item | Esforço | Risco |
|---|------|---------|-------|
| 8 | `loading.tsx` em rotas faltantes (~13 rotas) | Médio | Médio — telas brancas em loading |
| 9 | `error.tsx` em rotas faltantes (~15 rotas) | Médio | Médio — crash sem contexto |
| 10 | Empty states consistentes (usar componente) | Baixo | Baixo — inconsistência visual |
| 11 | Validação de env vars no bootstrap | Baixo | Médio — quebra silenciosa |
| 12 | A11y: `tabIndex` + `onKeyDown` em `role="button"` | Médio | Médio — inacessível por teclado |
| 13 | A11y: `htmlFor`/`id` em formulários | Baixo | Baixo — labels desconectados |
| 14 | Google Fonts via `next/font` (sem bloqueio) | Baixo | Baixo — performance |
| 15 | Dynamic imports: `@dnd-kit`, `react-easy-crop` | Médio | Baixo — bundle size |

## Média Prioridade (antes de v1.3)

| # | Item | Esforço | Risco |
|---|------|---------|-------|
| 16 | Observabilidade: integrar logs de server actions | Médio | Baixo |
| 17 | Error messages: mover de URL para flash cookies | Médio | Baixo |
| 18 | Middleware: validar matcher automaticamente | Baixo | Baixo |
| 19 | `@react-pdf/renderer` — remover ou usar | Baixo | Baixo |
| 20 | `robots.txt` + `sitemap.ts` para landing | Baixo | Baixo |
| 21 | Image optimization (`next/image`) | Médio | Baixo |

## Não-escopo (não fazer agora)

- Telehealth integrado (Zoom/Meet API)
- Chat/mensageria real-time entre psicólogo e paciente
- AI clinical writing (v3.0)
- Multi-user clinic management
- Analytics/telemetria
- CMS para conteúdo da landing

## Critérios de Aceite do Release

1. [ ] Zero crashes em flows críticos (sign-in → dashboard → paciente → agenda → prontuário)
2. [ ] 404 e error pages customizadas
3. [ ] Security headers configurados
4. [ ] XSS auditado e mitigado
5. [ ] A11y: navegação por teclado funcional nos forms principais
6. [ ] Loading states em todas as rotas primárias
7. [ ] `next build` limpo + `pnpm test` green
8. [ ] Playwright E2E: sign-in → criar paciente → agendar → registrar nota
9. [ ] `.env.example` atualizado + validação de vars
10. [ ] CI pipeline rodando tests + build

## Ordem de Execução Sugerida

1. **Sprint 1 — Estabilidade**: itens 1–7 (bloqueantes)
2. **Sprint 2 — Resiliência**: itens 8–11
3. **Sprint 3 — Acessibilidade**: itens 12–13
4. **Sprint 4 — Performance**: itens 14–15
5. **Sprint 5 — E2E + CI**: Playwright tests + GitHub Actions
6. **Sprint 6 — Deploy**: vercel.json, env vars, smoke tests

## Métricas de Sucesso

- Build time < 2min
- Test suite < 30s
- First contentful paint < 2s (desktop, 4G)
- Zero errors reportados em 7 dias de uso real
- Lighthouse: Performance > 80, A11y > 90, Best Practices > 90
