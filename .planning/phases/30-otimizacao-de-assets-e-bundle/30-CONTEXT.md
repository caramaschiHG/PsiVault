# Phase 30: Otimização de Assets e Bundle - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous execution)

<domain>
## Phase Boundary

Aplicação carrega menos bytes e renderiza imagens/fontes de forma eficiente. Charts, date pickers e PDF preview carregam sob demanda. Zero tags `<img>` raw. Requests externos de fontes eliminados ou migrados para `next/font`. Scripts de terceiros com estratégia apropriada.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices at Claude's discretion — autonomous mode. Use existing codebase patterns and ROADMAP success criteria to guide decisions.

### Key Constraints
- Bundle analyzer ativado condicionalmente via ANALYZE=true (já existe)
- `@react-pdf/renderer` já usa dynamic import em `src/lib/documents/pdf.tsx`
- `react-easy-crop` já é lazy-loaded em `signature-upload.tsx`
- `optimizePackageImports` já configurado com `date-fns`, `react-day-picker`, `@dnd-kit/core`, `@dnd-kit/utilities`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `next.config.ts` já tem `withBundleAnalyzer` configurado
- `optimizePackageImports` já parcialmente configurado

### Raw `<img>` Tags Found
- `src/app/(auth)/mfa-setup/page.tsx:254` — QR code TOTP
- `src/app/(vault)/settings/profile/components/signature-crop-modal.tsx:282,291` — recorte original + resultado
- `src/app/(vault)/settings/profile/components/signature-upload.tsx:182` — pré-visualização da assinatura

### Heavy Components Used
- `react-day-picker` em `mini-calendar.tsx`
- `recharts` não encontrado diretamente; charts parecem ser CSS-only ou outra lib
- `@react-pdf/renderer` — já lazy-loaded
- `react-easy-crop` — já lazy-loaded

### Integration Points
- `next.config.ts` — adicionar mais pacotes a `optimizePackageImports`
- Páginas que importam componentes pesados — aplicar `next/dynamic`
- Tags `<img>` raw — migrar para `next/image` ou justificar exceção

</code_context>

<specifics>
## Specific Ideas

- Migrar 4 tags `<img>` raw para `next/image` (exceto QR code que é data URL)
- Adicionar `lucide-react`, `@react-pdf/renderer` a `optimizePackageImports` se aplicável
- Verificar se há fontes externas em `layout.tsx` ou `_document`
- Verificar scripts de terceiros (analytics, etc.)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
