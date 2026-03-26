# Phase 21: Brand Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Documentar posicionamento psicanalítico e tokens visuais como ground truth canônico, e aplicar os tokens em uma superfície do produto. Esta fase entrega: (1) CLAUDE.md expandido com vocabulário, anti-padrões e regras de marca, (2) globals.css refinado com tokens editoriais, (3) sidebar com redesign parcial demonstrando a nova identidade.

</domain>

<decisions>
## Implementation Decisions

### Superfície de demonstração
- Aplicar na sidebar (`vault-sidebar-nav.tsx`) — visível em toda sessão autenticada
- Redesign **parcial**: além dos novos tokens de cor, ajustar tipografia (pesos, uso de serif onde cabível) e espaçamento (mais respiro)
- Layout e estrutura da sidebar não mudam — só aparência visual

### Conteúdo do CLAUDE.md
- Adicionar seção nova **"Posicionamento Psicanalítico"** separada da seção existente "Direção de Marca — Landing PsiVault"
- Seção deve cobrir:
  - **Vocabulário obrigatório**: termos clínicos corretos (`paciente` não `cliente`, `atendimento` não `serviço`, `prontuário` não `ficha`) e termos psicanalíticos usados corretamente (`acompanhamento`, `escuta`, `transferência` — em contexto)
  - **Anti-padrões de tom**: frases proibidas (`revolucione`, `potencialize`, `IA que entende você`), linguagem de coach/wellness, slogans vazios
  - **Regras do plano premium**: o assistente de pesquisa resume conceitos e indica obras, não reproduz textos protegidos, não faz diagnósticos, não simula analista
  - **Limites de copyright**: resumos e conceitos são ok; citações longas não; não reproduzir capítulos ou obras completas — regras gerais, sem listar autor por autor
- Manter seção "Direção de Marca — Landing PsiVault" existente intocada (cobre a landing)

### Nome de produto
- **PsiVault** é o nome de produto para UI, copy, landing e comunicação com usuário
- **PsiLock** é o nome técnico/repo (código, variáveis, paths, documentação interna de dev)
- CLAUDE.md deve fixar essa distinção explicitamente para evitar inconsistência em copy gerado por AI

### Tipografia editorial
- IBM Plex Serif para **h1 e h2 de páginas de conteúdo clínico** (prontuário, paciente, sessão) — não em navegação, labels ou formulários
- Escala de tamanhos atual (24/16/15/13/12px) **mantida** — não reescrever
- Refinar **pesos**: mais uso de 500/600 para hierarquia clara; não depender só de tamanho
- Refinar **line-height**: mais generoso para texto corrido e títulos (editorial, não compacto)
- IBM Plex Serif aplicado **somente via `var(--font-serif)`** ou classe explícita — nenhum elemento usa serif por padrão via seletor global

### Espaçamento generoso
- `--space-section-gap`: aumentar de `1.5rem` para `2rem`
- `--space-row-height`: aumentar de `3.5rem` para `4rem`
- `--space-page-padding-x` (2.5rem) já está adequado — não mudar

### Anti-padrões visuais internos
- Adicionar seção no CLAUDE.md com regras para o app interno (não só landing):
  - Sem gradientes decorativos em superfícies funcionais
  - Sombras contidas (`--shadow-sm` e `--shadow-md`) — nunca exageradas para "efeito"
  - Animações só quando melhoram orientação ou resposta de interação — não decorativas
  - Sem badges, chips coloridos ou indicadores de "novidade" sem função real
  - Hierarquia via tipografia e espaçamento — não via cor excessiva

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vault-sidebar-nav.tsx`: superfície de demonstração — usa `--color-sidebar-bg` e `--color-sidebar-active` diretamente
- `globals.css`: tokens CSS já definidos (cor, tipografia, sombras, espaçamento) — a fase refina valores e adiciona intenção editorial
- IBM Plex Serif já importado no `@import` do Google Fonts — nenhuma dependência nova necessária

### Established Patterns
- Estilo via CSS variables em `:root` — todos os ajustes de tokens ficam em `globals.css`, componentes não precisam mudar
- Paleta atual é **terracota quente** (`--color-accent: #9a3412`, `--color-sidebar-bg: #f0ebe2`) — a fase **não substitui** a paleta; ajusta line-height, pesos e espaçamento; a paleta "charcoal/sage" do v2.0 é direção para próximas fases visuais (landing)
- `satisfies React.CSSProperties` para estilos inline nos componentes

### Integration Points
- `src/app/globals.css` — ponto central de todos os tokens; edições aqui propagam para todo o app
- `src/app/(vault)/components/vault-sidebar-nav.tsx` — superfície de demonstração
- `CLAUDE.md` na raiz do projeto — lido por qualquer contribuidor/AI; a nova seção fica aqui

</code_context>

<specifics>
## Specific Ideas

- A paleta atual (terracota, off-white quente) já comunica a sensação certa — não quebrar. O refinamento é de hierarquia tipográfica e ritmo de espaçamento, não de cor.
- Serif só aparece onde o usuário está lendo conteúdo clínico — não em chrome de navegação. Essa distinção sinaliza "modo clínico" vs "modo operacional".
- A distinção PsiVault (produto) / PsiLock (técnico) deve estar no CLAUDE.md de forma explícita porque ferramentas AI tendem a misturar os dois nomes ao gerar copy.

</specifics>

<deferred>
## Deferred Ideas

- Migração completa para paleta charcoal/sage — a direção existe, mas a fase 21 não troca cores do app; isso acompanha a landing (fase 22+)
- Redesign do dashboard — fora do escopo desta fase, que cobre só sidebar como demonstração

</deferred>

---

*Phase: 21-brand-foundation*
*Context gathered: 2026-03-26*
