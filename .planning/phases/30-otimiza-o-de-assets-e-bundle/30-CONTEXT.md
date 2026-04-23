# Phase 30: Otimização de Assets e Bundle - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Reduzir bytes carregados no bundle inicial e otimizar renderização de assets (imagens, fontes, scripts). A aplicação deve carregar menos bytes e renderizar imagens/fontes de forma eficiente.

Success criteria:
1. Charts, date pickers e PDF preview carregam sob demanda em vez de no bundle inicial
2. Imports de bibliotecas utilitárias são tree-shaken via `optimizePackageImports`
3. Zero tags `<img>` raw permanecem na codebase (ou justificados documentadamente)
4. Requests externos de fontes são eliminados ou migrados para `next/font`
5. Scripts de terceiros carregam com estratégia apropriada (`lazyOnload`/`worker`)
</domain>

<decisions>
## Implementation Decisions

### Imagens raw
- **D-01:** Manter tags `<img>` raw para imagens dinâmicas (object URLs e signed URLs), com justificativa documentada no código via comentário explicativo
- **D-02:** Não migrar para `next/image` porque: (a) object URLs são efêmeros e não se beneficiam do otimizador, (b) signed URLs do Supabase Storage já servem imagens otimizadas, (c) adicionar o domínio do Supabase em `images.remotePatterns` aumenta a superfície de configuração sem ganho proporcional
- **D-03:** Documentar no CLAUDE.md ou em comentários no código a exceção para imagens dinâmicas

### Lazy loading de bibliotecas pesadas
- **D-04:** Aplicar `next/dynamic` com `ssr: false` para `react-day-picker` (mini-calendar da agenda)
- **D-05:** Aplicar `next/dynamic` com `ssr: false` para `@dnd-kit/core` e `@dnd-kit/utilities` (drag-and-drop da agenda)
- **D-06:** Aplicar `next/dynamic` com `ssr: false` para `react-easy-crop` (crop de assinatura no perfil)
- **D-07:** Manter `optimizePackageImports` no `next.config.ts` como camada adicional de tree-shaking para essas bibliotecas

### web-vitals
- **D-08:** Manter `web-vitals` no bundle inicial. ~3KB gzipped é aceitável para métricas críticas de performance (CWV collector, fase 27)
- **D-09:** Não aplicar lazy loading em `web-vitals` — a complexidade não justifica o ganho para um módulo tão pequeno e fundamental

### the agent's Discretion
- Estados de loading para componentes lazy-loaded (skeletons, spinners, placeholders)
- Estratégia exata de preloading dos chunks dinâmicos (prefetch, preload)
- Implementação do wrapper `next/dynamic` em cada componente (como tratar props, tipos, fallback)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project configuration
- `next.config.ts` — Configuração atual do Next.js, incluindo `optimizePackageImports` e bundle analyzer
- `package.json` — Lista completa de dependências com versões

### Lazy loading patterns
- `src/lib/documents/pdf.tsx` — Existente pattern de dynamic import lazy para `@react-pdf/renderer` (a ser replicado)

### Componentes afetados
- `src/app/(vault)/agenda/components/mini-calendar.tsx` — Usa `react-day-picker`
- `src/app/(vault)/agenda/components/appointment-block.tsx` — Usa `@dnd-kit`
- `src/app/(vault)/agenda/components/calendar-grid.tsx` — Usa `@dnd-kit`
- `src/app/(vault)/agenda/components/week-calendar-grid.tsx` — Usa `@dnd-kit`
- `src/app/(vault)/settings/profile/components/signature-crop-modal.tsx` — Usa `react-easy-crop`

### Imagens
- `src/app/(vault)/settings/profile/components/signature-crop-modal.tsx` — 2 tags `<img>` raw (object URLs)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` — 1 tag `<img>` raw (signed URL)

### CWV/Performance
- `src/components/cwv-collector.tsx` — Client Component que importa `web-vitals`
- `src/app/api/metrics/route.ts` — Endpoint que recebe métricas CWV

### Styles
- `src/app/globals.css` — Importa Google Fonts via `@import` (não será alterado nesta fase)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/documents/pdf.tsx` — Pattern de lazy loading via `import()` function. O módulo é cacheado em variável de closure (`pdfModulePromise`) para evitar múltiplos downloads. Pode ser replicado para outras bibliotecas.
- `src/components/cwv-collector.tsx` — Pattern de coleta de métricas CWV com batching e `navigator.sendBeacon`

### Established Patterns
- `optimizePackageImports` já configurado em `next.config.ts` para `date-fns`, `react-day-picker`, `@dnd-kit/core`, `@dnd-kit/utilities`
- Bundle analyzer ativado condicionalmente via `ANALYZE=true`
- Design tokens em `globals.css` com variáveis CSS (`--duration-*`, `--ease-*`, etc.)
- Todos os componentes UI usam inline `satisfies React.CSSProperties` (não Tailwind)

### Integration Points
- `next.config.ts` — Adicionar/remover bibliotecas de `optimizePackageImports`, configurar `images.remotePatterns` se necessário (não necessário nesta fase)
- `src/app/(vault)/layout.tsx` — CwvCollector é montado aqui; se web-vitals fosse lazy-loaded, seria aqui que a lógica de carregamento viveria
- `src/app/(vault)/agenda/` — Componentes da agenda que precisam de lazy loading
- `src/app/(vault)/settings/profile/` — Componentes de perfil que precisam de lazy loading

</code_context>

<specifics>
## Specific Ideas

- O projeto já tem um excelente pattern de lazy loading em `pdf.tsx` que pode ser usado como template
- Não há bibliotecas de charts no projeto atualmente (recharts, victory, etc. não estão nas dependências), então o success criteria "charts carregam sob demanda" não se aplica — já está atendido por ausência
- Não há scripts de terceiros no projeto atualmente (gtag, analytics, etc.), então o success criteria "scripts de terceiros" é preventivo — documentar em CLAUDE.md o padrão para futuras adições
- As imagens raw existentes são: (1) previews de recorte de assinatura (object URLs efêmeros, duram segundos), (2) assinatura profissional em documentos (signed URL do Supabase, 1h de expiração)

</specifics>

<deferred>
## Deferred Ideas

### Fontes externas → next/font
- Migrar IBM Plex Sans/Serif de `@import` do Google Fonts em `globals.css` para `next/font`
- **Motivo do defer:** Não foi selecionado para discussão nesta fase
- **Impacto:** Elimina request HTTP externo bloqueante, permite subsetting e preload automático
- **Complexidade:** Média — requer refatoração de como as fontes são referenciadas em toda a codebase
- **Quando reconsiderar:** Phase 31 (Medição) ou futura fase de otimização de performance crítica

### Scripts de terceiros
- Documentar em CLAUDE.md o padrão para adição futura de scripts externos (lazyOnload/worker)
- **Motivo do defer:** Não há scripts de terceiros no projeto atualmente
- **Quando reconsiderar:** Quando adicionar analytics, chat widget, ou outro script externo

</deferred>

---

*Phase: 30-otimiza-o-de-assets-e-bundle*
*Context gathered: 2026-04-23*
