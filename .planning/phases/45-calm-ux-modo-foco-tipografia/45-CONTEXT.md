# Phase 45: Calm UX — Modo Foco & Tipografia - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar modo foco para escrita clínica (prontuário e documentos formais) que oculta elementos de navegação e distração, exibindo apenas o editor e identificação mínima do paciente. Ajustar largura do editor para ~70ch com tipografia otimizada para leitura/escrita prolongada. Transição suave de 200ms ease-out, respeitando prefers-reduced-motion.

Escopo fixo (ROADMAP.md):
- Modo foco ativado por botão no editor e atalho de teclado
- Sidebar, top-bar, breadcrumbs, campos opcionais e notificações (dropdown) ocultados
- Editor de notas clínicas com largura máxima de ~70ch
- Transição suave de 200ms ease-out
- Respeito a prefers-reduced-motion

Depends on: Phase 42 (Documentos v1.6)
Requirements: CALM-01, CALM-02

</domain>

<decisions>
## Implementation Decisions

### O que exatamente some no modo foco
- **D-01:** Elementos ocultados no modo foco: **sidebar, top-bar, breadcrumbs, campos opcionais** do prontuário, e dropdown de notificações.
- **D-02:** **Toasts de auto-save e confirmações são mantidos** — feedback essencial que não pode ser suprimido sem prejuízo à experiência.
- **D-03:** **Bottom nav mobile permanece visível** — não se oculta para evitar travar o usuário em mobile sem saída visível.
- **D-04:** **Toolbar do editor permanece visível mas em versão minimalista/discreta** — o psicólogo precisa de formatação, mas com menos botões e cores mais apagadas.
- **D-05:** **Identificação mínima do paciente = nome do paciente + data do atendimento** — exibidos de forma discreta no topo da tela.
- **D-06:** **Campos opcionais do prontuário (Demanda, Humor observado, Temas, etc.) são ocultados** no modo foco. Só o registro principal permanece.
- **D-07:** **Breadcrumbs são ocultados** no modo foco.

### Como ativar e desativar o modo foco
- **D-08:** **Botão no editor + atalho de teclado Ctrl/Cmd+Shift+F** — padrão familiar de apps de produtividade (Notion, Obsidian).
- **D-09:** **Estado não persiste entre sessões** — reseta ao sair/recarregar a página. O usuário ativa explicitamente quando quer.
- **D-10:** **Escopo independente por página** — um editor pode estar em modo foco enquanto outro (em outra aba/página) permanece normal.
- **D-11:** **Sempre disponível, sem toggle em Configurações** — modo foco é um recurso universal, não requer opt-in.

### Aplicação ao editor de documentos formais
- **D-12:** **Modo foco aplicado ao RichTextEditor de documentos formais também** — consistência em toda escrita clínica (laudos, declarações, relatórios).
- **D-13:** **Comportamento idêntico ao prontuário** — mesmos elementos ocultos, mesma identificação mínima, mesma toolbar minimalista.
- **D-14:** **Largura ~70ch em documentos formais fica a critério do agente** — documentos têm layout A4 com margens próprias, pode não fazer sentido aplicar ~70ch ali.

### Largura ~70ch e tipografia
- **D-15:** **Editor centralizado na tela com max-width de ~70ch** — visual editorial calmo, tipo Medium/Substack.
- **D-16:** **Todo o conteúdo da página (editor + toolbar + identificação mínima) limitado a ~70ch** — consistência visual, nada extrapola a largura de leitura confortável.
- **D-17:** **Fonte aumenta levemente no modo foco** — maior conforto para escrita prolongada (tamanho exato a critério do agente).
- **D-18:** **Line-height mantém 1.75** — já é o valor recomendado para leitura prolongada, não precisa mudar.

### the agent's Discretion
- Tamanho exato do aumento de fonte no modo foco (ex: 16px → 17px ou 18px)
- Implementação da toolbar minimalista (quais botões específicos mostrar/esconder)
- Decisão final sobre aplicar ~70ch ao RichTextEditor de documentos formais
- CSS exato da classe `.focus-mode` e transições de layout
- Estratégia de implementação do atalho Ctrl/Cmd+Shift+F (KeyboardShortcutsProvider vs. hook local)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & requirements
- `.planning/ROADMAP.md` §Phase 45 — Goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` §CALM-01, CALM-02 — Requisitos de Calm UX
- `.planning/PROJECT.md` §Current Milestone v2.0 — Vision, constraints, Calm UX principles

### Design system & motion
- `DESIGN.md` §3 (Tipografia), §7 (Movimento e Transição) — Tokens de fonte, line-height, duração, easing
- `src/styles/motion.css` — Classes utilitárias, keyframes, prefers-reduced-motion
- `src/app/globals.css` — Variáveis CSS, tema dark via `data-theme`

### Layout existente
- `src/app/(vault)/layout.tsx` — VaultLayout com sidebar, top-bar, bottom-nav, toast, notification provider
- `src/app/(vault)/components/top-bar.tsx` — Top bar atual
- `src/app/(vault)/components/vault-sidebar-nav.tsx` — Sidebar navigation
- `src/app/(vault)/components/bottom-nav.tsx` — Bottom nav mobile

### Editores
- `src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx` — Note composer com focusMode básico existente
- `src/components/ui/rich-text-editor.tsx` — RichTextEditor para documentos formais

### Providers & contextos
- `src/app/(vault)/components/keyboard-shortcuts-provider.tsx` — Provider de atalhos (só Cmd+K hoje)
- `src/components/ui/theme-provider.tsx` — ThemeProvider com light/dark/system
- `src/components/ui/toast-provider.tsx` — ToastProvider
- `src/components/ui/notification-context.tsx` — NotificationProvider

### Contexto de fases anteriores
- `.planning/phases/36-polish-accessibility-and-measurement/36-CONTEXT.md` — Motion tokens e prefers-reduced-motion
- `.planning/phases/39-editor-unificado/39-CONTEXT.md` — RichTextEditor, DocumentComposerForm
- `.planning/phases/43-arquitetura-multi-agent-foundation/43-CONTEXT.md` — Princípios Calm UX, priorização de interrupções

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`note-composer-form.tsx`** — Já tem estado `focusMode` e botão de toggle, mas implementação básica (só colapsa sidebar via `document.querySelector`). Pode ser refatorado para usar classe CSS global.
- **`RichTextEditor`** — Editor rich text para documentos formais. Não tem modo foco. Pode receber prop `focusMode` para ajustar toolbar e estilos.
- **`VaultLayout`** — Layout principal com `vault-sidebar`, `vault-content`, `vault-page-enter`. Pode receber classe `.focus-mode` no root para esconder elementos via CSS.
- **`KeyboardShortcutsProvider`** — Só tem Cmd+K hoje. Pode ser estendido com Ctrl/Cmd+Shift+F.
- **`ThemeProvider`** — Já gerencia tema light/dark. Modo foco é independente, mas pode compartilhar padrão de persistência (ou não, conforme decisão D-09).

### Established Patterns
- **Motion tokens**: `--duration-200`, `--ease-out` já definidos. Transição de 200ms é o padrão do app.
- **prefers-reduced-motion**: `motion.css` já cobre 20+ classes. Novas animações de modo foco devem seguir o mesmo padrão.
- **Inline styles com `satisfies React.CSSProperties`**: Padrão do app. Evitar classes CSS novas onde inline é suficiente.
- **DOM classes para estado global**: `.vault-sidebar.collapsed` já existe (embora via DOM hack). Migrar para classe no root (ex: `html[data-focus-mode="true"]` ou classe no shell).

### Integration Points
- **`VaultLayout`** — Adicionar classe de modo foco no shell para que sidebar, top-bar, breadcrumbs possam ser estilizados via CSS.
- **`note-composer-form.tsx`** — Refatorar focusMode existente para usar o novo sistema global (não mais DOM query direto).
- **`document-composer-form.tsx`** — Adicionar toggle de modo foco e comportamento idêntico ao note composer.
- **`KeyboardShortcutsProvider`** — Adicionar listener para Ctrl/Cmd+Shift+F que dispara evento ou toggle de classe.
- **`RichTextEditor`** — Receber prop `focusMode` para ajustar toolbar (minimalista) e estilos do editor.
- **globals.css / motion.css** — Adicionar regras `.focus-mode` para esconder/mostrar elementos com transição suave.

</code_context>

<specifics>
## Specific Ideas

- O modo foco deve usar uma classe no elemento raiz do layout (ex: `.focus-mode` no `div` do `VaultLayout`) em vez de manipular DOM diretamente. Isso permite que qualquer componente filho reaja ao estado via CSS.
- A identificação mínima do paciente pode ser um componente discreto no topo: fonte `--font-size-meta`, cor `--color-text-3`, sem background, posicionado acima do editor.
- A toolbar minimalista pode mostrar apenas os botões mais usados (negrito, itálico, lista) e esconder os demais. Em documentos (RichTextEditor), a toolbar rica pode colapsar para uma linha de ícones menores.
- A transição de entrada/saída do modo foco deve usar `transition: opacity var(--duration-200) var(--ease-out), transform var(--duration-200) var(--ease-out)` nos elementos que somem. Sidebar pode fazer `translateX(-100%)` + fade; top-bar pode fazer `translateY(-100%)` + fade.
- O aumento de fonte no modo foco pode ser de `var(--font-size-body)` (16px) para `var(--font-size-body-sm)` não, isso é menor. Melhor: de 0.95rem para 1rem ou 1.05rem no editor.
- O max-width de ~70ch pode ser implementado via `max-width: 70ch; margin: 0 auto;` no container do editor.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 45-calm-ux-modo-foco-tipografia*
*Context gathered: 2026-04-27*
