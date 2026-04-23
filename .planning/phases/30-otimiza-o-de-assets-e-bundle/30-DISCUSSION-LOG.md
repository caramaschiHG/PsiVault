# Phase 30: Otimização de Assets e Bundle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 30-otimiza-o-de-assets-e-bundle
**Areas discussed:** Imagens raw, Lazy loading de bibliotecas pesadas, web-vitals

---

## Imagens raw → next/image

| Option | Description | Selected |
|--------|-------------|----------|
| Manter `<img>` com justificativa documentada | Imagens dinâmicas (object URLs e signed URLs) não se beneficiam do otimizador de imagens do next/image. Manter `<img>` é aceitável quando a imagem já está otimizada na origem. Adicionar comentário justificativo no código. | ✓ |
| Usar next/image para consistência | Migrar todas as 3 tags para next/image, mesmo sendo dinâmicas. Garante consistência e aproveita lazy loading nativo. Requer adicionar domínio do Supabase Storage em images.remotePatterns. | |
| Híbrido: next/image só para assinatura do documento | A assinatura na visualização de documentos pode usar next/image com lazy loading. Os previews no crop modal mantêm `<img>` porque são temporários. | |

**User's choice:** Manter `<img>` com justificativa documentada
**Notes:** Imagens são dinâmicas (object URLs efêmeros e signed URLs do Supabase). next/image não agrega valor aqui. Documentar exceção no código.

---

## Lazy loading de bibliotecas pesadas

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy loading para DnD e crop apenas | Aplicar next/dynamic apenas em @dnd-kit (agenda) e react-easy-crop (perfil). Manter react-day-picker como import estático porque é usado na agenda (página frequente). | |
| Lazy loading para todas as 3 | Aplicar next/dynamic em react-day-picker, @dnd-kit e react-easy-crop. Maximiza redução do bundle inicial. Navegações subsequentes no client-side já terão o chunk carregado. | ✓ |
| Manter todas como import estático | O optimizePackageImports já resolve o tree-shaking. Adicionar next/dynamic aumenta complexidade sem ganho proporcional. | |

**User's choice:** Lazy loading para todas as 3
**Notes:** Usar next/dynamic com ssr: false. Estados de loading ficam a critério do executor (agent's discretion).

---

## web-vitals no bundle inicial

| Option | Description | Selected |
|--------|-------------|----------|
| Manter no bundle inicial | 3KB é pequeno e a biblioteca é crítica para métricas de performance. Não vale a complexidade de lazy loading. | ✓ |
| Lazy load após primeiro paint | Carregar web-vitals dinamicamente após o primeiro paint. Libera thread principal para renderizar UI primeiro. | |

**User's choice:** Manter no bundle inicial
**Notes:** Biblioteca é pequena (~3KB gzipped) e fundamental para observabilidade de performance (CWV collector, fase 27).

---

## the agent's Discretion

- Estados de loading para componentes lazy-loaded (skeletons, spinners, placeholders) — executor define com base nos padrões existentes

## Deferred Ideas

- Fontes externas → next/font: Não selecionado para discussão. Migrar IBM Plex de @import do Google Fonts para next/font elimina request externo.
- Scripts de terceiros: Não há scripts atualmente. Documentar padrão para futuras adições.

