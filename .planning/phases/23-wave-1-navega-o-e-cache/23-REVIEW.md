---
phase: 23
reviewed: 2026-04-22T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/app/(vault)/components/vault-sidebar-nav.tsx
  - src/app/(vault)/components/bottom-nav.tsx
  - src/app/(vault)/layout.tsx
  - src/app/(vault)/patients/archive/page.tsx
  - src/lib/supabase/server.ts
  - src/lib/supabase/session.ts
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-04-22
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Migration de `<a href>` para `<Link href>` está correta em ambos os componentes de navegação. O link de signout em `vault-sidebar-nav.tsx` foi mantido corretamente como `<a href="/api/auth/signout">` — isso é essencial porque o signout requer um full page request, não uma navegação client-side.

O wrap com `React.cache()` foi aplicado corretamente em `server.ts` e `session.ts`, ambos importando `cache` de `'react'` (correto). A lógica interna de nenhuma das funções foi alterada.

A remoção de `export const dynamic = "force-dynamic"` em `layout.tsx` e `archive/page.tsx` está adequada dado o uso do `React.cache()` para deduplicar chamadas de sessão por render.

Há um warning de segurança leve e dois itens informativos descritos abaixo.

---

## Warnings

### WR-01: `resolveSession` com `React.cache()` executa auto-provision dentro do cache scope

**File:** `src/lib/supabase/session.ts:16`
**Issue:** `resolveSession` é cacheada por render, mas contém um efeito colateral com escrita no banco (`db.account.upsert` / workspace auto-provision). Se duas chamadas concorrentes chegarem ao mesmo tempo *antes* do cache ser preenchido (ex: em contextos paralelos com `Promise.all`), o efeito colateral pode ser executado múltiplas vezes em diferentes requests. O `React.cache()` deduplica *dentro* de um único render tree, não entre requests concorrentes do servidor — isso já era o comportamento anterior, mas vale registrar explicitamente agora que a função é apresentada como "cacheada".

**Fix:** Sem mudança imediata necessária — o comportamento já era assim antes do cache. Para robustez futura, o `upsert` já usa `where: { id: accountId }` o que é idempotente. Apenas documentar que o cache deduplication é por-render, não global.

---

## Info

### IN-01: Variável morta `settingsLinkStyle_hover`

**File:** `src/app/(vault)/components/vault-sidebar-nav.tsx:212`
**Issue:** A variável `settingsLinkStyle_hover` é declarada mas nunca usada. É provavelmente um resquício de uma abordagem de hover inline que não foi implementada.
**Fix:** Remover a linha `const settingsLinkStyle_hover = "rgba(255,255,255,0.95)";`.

### IN-02: `empty catch` silencia erros de `setAll` sem logging

**File:** `src/lib/supabase/server.ts:21-25`
**Issue:** O bloco `catch` no `setAll` do cookie store é intencionalmente silencioso (comentário explica que é esperado em Server Components). Contudo, não há distinção entre o erro esperado e erros inesperados — qualquer falha ao setar cookies é descartada. Isso veio do template oficial do Supabase, mas vale monitorar em produção.
**Fix:** Manter como está (está alinhado com a recomendação oficial do Supabase SSR). Registrar aqui para awareness.

---

_Reviewed: 2026-04-22_
_Reviewer: gsd-code-reviewer_
_Depth: standard_
