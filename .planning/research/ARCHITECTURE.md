# Architecture Research — v2.0 Reposicionamento Psicanalítico

## Question
Como as novas features do v2.0 se integram à arquitetura Next.js 15 App Router existente?

## Findings

### Novos componentes e rotas

**Landing page:**
- Rota: `/` (root) — fora dos grupos `(auth)` e `(vault)`
- Arquivo: `src/app/page.tsx` (provavelmente já existe ou redireciona para `/login`)
- Subcomponentes em `src/components/landing/`
- Layout separado: `src/app/layout.tsx` raiz — sem sidebar/nav do vault

**Pricing page:**
- Rota: `/planos` ou integrado à landing como seção
- Server Component puro — sem estado, sem auth necessária

**Premium AI Research Assistant:**
- Rota protegida: `(vault)/pesquisa/`
- Backend: Route Handler em `src/app/api/pesquisa/route.ts` — streaming com Claude API
- Config do usuário: nova tabela `workspace_ai_preferences` com `preferred_thinker`, `psychoanalytic_line`
- Server Action para salvar preferências em settings existente
- Componente de chat: Client Component para streaming UI

**Copy management:**
- Padrão: constantes de string organizadas por módulo diretamente nos componentes ou em `src/lib/copy/`
- Sem lib de i18n — produto é pt-BR exclusivo

### Modificações em arquivos existentes

**CLAUDE.md:** Atualizar com nova identidade de produto, vocabulário, anti-padrões

**globals.css:** Possível ajuste de CSS vars para direção visual mais editorial

**Módulos existentes — copy em todos:**
- `src/app/(vault)/patients/` — labels, empty states, títulos
- `src/app/(vault)/appointments/` — idem
- `src/app/(vault)/records/` ou equivalente — idem
- `src/app/(vault)/documents/` — idem
- `src/app/(vault)/finance/` — idem
- Sidebar/nav — renomear itens de navegação

### Ordem de build sugerida

1. **CLAUDE.md + identidade** — âncora do posicionamento (já feito em parte)
2. **Landing page** — a face pública do produto
3. **Módulos internos: copy + renomeação** — coesão da experiência
4. **Pricing page** — suporte ao plano premium
5. **Settings: preferências AI** — prep para assistente
6. **Assistente de pesquisa** — feature premium core

### Schema additions (Prisma — additive only)

```prisma
model WorkspaceAIPreferences {
  workspaceId        String   @id
  preferredThinker   String?  // "Freud", "Lacan", "Winnicott", etc.
  psychoanalyticLine String?  // "freudiana", "lacaniana", "kleiniana", etc.
  updatedAt          DateTime @updatedAt
}
```

Sem breaking changes em modelos existentes.

## Conclusion
A arquitetura existente suporta bem o v2.0. Não há refatoração estrutural — é additive. O maior risco é garantir que landing e vault compartilhem sistema visual sem conflitar layouts.
