# Phase 13: UI/UX Polish - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Aplicar design system consistente e polish visual em todas as views para o produto parecer produção-ready. Inclui: tipografia, responsivo/mobile, empty states, loading/error states, e identidade visual das páginas primárias. Não inclui novas funcionalidades.

</domain>

<decisions>
## Implementation Decisions

### Tipografia e hierarquia
- IBM Plex Serif para títulos de página (h1, nome do paciente, headings principais) — IBM Plex Sans para todo o resto
- Escala de títulos de página: `1.5rem` (24px)
- Metadados, datas, status, texto de apoio: `0.8125rem` (13px)
- Títulos de seção interna (ex: "HOJE", "LEMBRETES"): `font-weight: 600` + `text-transform: uppercase` + `letter-spacing`
- Body text padrão: `0.9375rem` (15px)

### Responsivo e mobile
- Breakpoints: `sm: 640px` / `md: 768px` / `lg: 1024px`
- Em mobile (< 768px): sidebar some, aparece **bottom navigation bar** com ícones das 5 seções principais
- Listas densas em mobile (pacientes, agenda): transformar em **cards empilhados verticais** com as informações mais importantes
- Header de página em mobile: título da página + **FAB (floating action button)** no canto inferior direito para ação primária
- Formulários em mobile: **1 coluna, campos full-width**, scroll único para formulários longos — sem wizard ou seções colapsáveis

### Empty states
- Visual: **ícone SVG + título + descrição + botão de ação** (ex: ícone de calendário + "Sua semana está livre" + "Adicionar sessão")
- Tom: **humanizado e gentil** — "Sua semana está livre", "Nenhum paciente ainda — comece adicionando o primeiro", "Tudo em dia!"
- Ações no empty state devem levar diretamente ao fluxo de criação relevante

### Loading e error states
- Loading: **`loading.tsx` por rota** com skeleton adequado ao conteúdo + estado pendente em botões de ação (disabled + spinner)
- Errors: **`error.tsx` por rota** com mensagem amigável ("Algo deu errado") + botão "Tentar novamente" — isola o erro na rota sem quebrar o app todo

### Identidade visual das páginas
- Layout: **template base** (padding padrão + header com título + ação primária) + **adaptações por página** (agenda usa seu layout próprio, lista usa linhas, etc.)
- Densidade: **compacta com respiro** — rows de 56-64px, padding generoso, espaço entre seções de 1.5-2rem (referência: Linear, Notion)
- Listas de pacientes e cobranças: **lista em linhas com hover** (table-like), não cards em grid

### Sidebar (redesenho)
- Direção: **mais escura e profissional** — sidebar em tom warm dark (ex: derivado do `--color-accent` escurecido ou similar) com texto claro, contraste forte com a área de conteúdo clara
- Adicionar grupos de navegação com separadores visuais
- Rodapé da sidebar: **avatar (iniciais) + nome do profissional + link de sair** — afirma o usuário logado e o workspace

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `globals.css`: tokens completos já existem — `--color-*`, `--radius-*`, `--shadow-*`, IBM Plex Sans/Serif importadas. Não criar novos tokens, apenas usar os existentes e adicionar o que faltar (ex: `--font-serif`, escala tipográfica como custom props)
- `.btn-primary`, `.btn-secondary`, `.nav-link`, `.nav-link.active`: classes CSS já implementadas — manter e expandir
- `VaultSidebarNav` (`src/app/(vault)/components/vault-sidebar-nav.tsx`): componente client island para active state — redesenhar aqui
- `SearchBar` (`src/app/(vault)/components/search-bar.tsx`): permanece na sidebar

### Established Patterns
- **Inline styles com `satisfies React.CSSProperties`**: padrão do projeto — manter, não migrar para classes CSS (exceto utilitários globais já em globals.css)
- **Server Components por padrão**: páginas são async server components; client islands só onde há interatividade
- **CSS vars**: toda cor, radius e shadow via `var(--token)` — não hardcodar valores
- Formulários: `<form>` com server actions — campos recebem `name`, resultado via URL params

### Integration Points
- Sidebar redesenhada impacta `src/app/(vault)/layout.tsx` (estrutura e estilos)
- Bottom nav mobile será um novo componente client (precisa de `usePathname`)
- `loading.tsx` e `error.tsx` adicionados por rota dentro de `(vault)/`
- Empty states podem ser um componente utilitário compartilhado (`EmptyState`) injetado nas páginas

</code_context>

<specifics>
## Specific Ideas

- Sidebar escura: referência visual Linear e Vercel dashboard — sidebar dark com conteúdo claro
- Títulos de seção em uppercase: referência ao estilo de apps clínicos/SaaS profissionais (ex: "HOJE", "LEMBRETES ATIVOS", "RESUMO DO MÊS")
- Empty states humanizados: tom que comunica que o sistema está saudável, não que deu erro — ex: "Sua semana está livre" para agenda vazia, "Tudo em dia!" para lembretes sem pendências

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia de escopo expandido surgiu — discussão permaneceu dentro dos limites da fase

</deferred>

---

*Phase: 13-ui-ux-polish*
*Context gathered: 2026-03-18*
