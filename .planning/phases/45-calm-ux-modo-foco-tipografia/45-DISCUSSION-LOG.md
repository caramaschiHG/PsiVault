# Phase 45: Calm UX — Modo Foco & Tipografia - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 45-Calm UX — Modo Foco & Tipografia
**Areas discussed:** O que exatamente some no modo foco, Como ativar e desativar o modo foco, Aplicação ao editor de documentos formais, Largura ~70ch e tipografia

---

## O que exatamente some no modo foco

| Option | Description | Selected |
|--------|-------------|----------|
| Manter toasts | Toast de auto-save e confirmações continuam visíveis — são feedback essencial | ✓ |
| Suprimir toasts | Zero interrupções visuais no modo foco, mesmo toasts desaparecem | |
| Você decide | O agente escolhe o comportamento padrão | |

**User's choice:** Manter toasts
**Notes:** Auto-save feedback is essential and should not be suppressed even in focus mode.

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas o nome do paciente | Texto discreto no topo, sem foto nem data | |
| Nome + data do atendimento | Ex: 'Ana Silva — 27/04/2026, 14h'. Contexto temporal ajuda o psicólogo | ✓ |
| Nome + foto + data | Mais contexto visual, mas ocupa mais espaço | |
| Você decide | O agente escolhe o padrão mais calmo | |

**User's choice:** Nome + data do atendimento
**Notes:** Temporal context helps the psychologist during writing.

| Option | Description | Selected |
|--------|-------------|----------|
| Esconder bottom nav também | Toda navegação some. Usuário usa gesto de voltar do SO ou atalho para sair | |
| Manter bottom nav visível | Mesmo no modo foco, a barra inferior continua para não travar o usuário em mobile | ✓ |
| Você decide | O agente escolhe o comportamento padrão | |

**User's choice:** Manter bottom nav visível
**Notes:** Safety concern — mobile users need a visible exit path.

| Option | Description | Selected |
|--------|-------------|----------|
| Esconder toolbar | Modo zen total — só o texto e o cursor. Formatação via atalhos de teclado | |
| Manter toolbar minimalista | Toolbar fica visível mas mais discreta (menos botões, cores apagadas) | ✓ |
| Você decide | O agente escolhe o padrão | |

**User's choice:** Manter toolbar minimalista
**Notes:** Psychologists need formatting tools but in a quieter presentation.

| Option | Description | Selected |
|--------|-------------|----------|
| Esconder campos opcionais | Modo foco = só o registro principal. Campos opcionais só aparecem fora do modo foco | ✓ |
| Manter campos opcionais | Psicólogo pode precisar preenchê-los durante a sessão — ficam visíveis mas mais compactos | |
| Você decide | O agente escolhe o padrão | |

**User's choice:** Esconder campos opcionais
**Notes:** Focus mode is about the primary note only.

| Option | Description | Selected |
|--------|-------------|----------|
| Esconder breadcrumbs | Tudo que não é essencial some. Menos elementos na tela = mais calma | ✓ |
| Manter breadcrumbs | Ajuda o psicólogo a saber onde está, especialmente se entrou via link direto | |
| Você decide | O agente escolhe o padrão | |

**User's choice:** Esconder breadcrumbs
**Notes:** Less visual clutter aligns with calm UX principles.

---

## Como ativar e desativar o modo foco

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, Ctrl/Cmd+Shift+F | Padrão de apps como Notion e Obsidian — atalho familiar | ✓ |
| Sim, tecla Escape | Mais simples e intuitivo: Esc entra no modo foco, Esc de novo sai | |
| Não, apenas botão no editor | Evita conflitos com atalhos existentes e screen readers | |
| Você decide | O agente escolhe o atalho mais adequado | |

**User's choice:** Sim, Ctrl/Cmd+Shift+F
**Notes:** Standard productivity app shortcut pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Persistir por sessão de navegação | Se o usuário ativou modo foco e fechou a aba, ao voltar ao editor ele ainda está em modo foco | |
| Não persistir | Modo foco reseta a cada nova visita à página. O usuário ativa explicitamente quando quer | ✓ |
| Persistir apenas para aquela página/rota | Ex: se ativou em /sessions/123/note, só volta em modo foco ao reabrir essa nota específica | |
| Você decide | O agente escolhe o comportamento padrão | |

**User's choice:** Não persistir
**Notes:** User wants explicit activation each time.

| Option | Description | Selected |
|--------|-------------|----------|
| Independente por página | Usuário pode estar em modo foco no prontuário do Paciente A e em modo normal no documento do Paciente B | ✓ |
| Global para todo o app | Ativar modo foco em qualquer editor ativa em todos. Mais simples e previsível | |
| Você decide | O agente escolhe o comportamento padrão | |

**User's choice:** Independente por página
**Notes:** More flexible — different pages can have different focus states.

| Option | Description | Selected |
|--------|-------------|----------|
| Sempre disponível, sem configuração | O modo foco é um recurso universal do app, não precisa de opt-in | ✓ |
| Toggle em Configurações > Aparência | Usuário pode desabilitar completamente o modo foco se não quiser | |
| Você decide | O agente escolhe o padrão | |

**User's choice:** Sempre disponível, sem configuração
**Notes:** No need for a settings toggle — focus mode is a universal feature.

---

## Aplicação ao editor de documentos formais

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, agora | Modo foco disponível em ambos: notas clínicas e documentos formais. Experiência consistente | ✓ |
| Não, apenas notas | Documentos formais têm necessidades diferentes (seções estruturadas, preview A4). Modo foco fica só no prontuário por enquanto | |
| Você decide | O agente escolhe com base no esforço vs. valor | |

**User's choice:** Sim, agora
**Notes:** Consistency across all clinical writing surfaces.

| Option | Description | Selected |
|--------|-------------|----------|
| Aplica-se a ambos | ~70ch em notas e documentos. Consistência tipográfica em toda escrita clínica | |
| Só no prontuário | Documentos formais têm layout A4 com margens próprias — a largura ~70ch não faz sentido lá | |
| Você decide | O agente escolhe com base no layout existente | ✓ |

**User's choice:** Você decide
**Notes:** Left to agent discretion — documents have A4 layout constraints.

| Option | Description | Selected |
|--------|-------------|----------|
| Idêntico ao prontuário | Mesma lógica: esconde sidebar, top-bar, breadcrumbs, campos opcionais. Toolbar minimalista | ✓ |
| Toolbar de formatação sempre visível | Documentos formais precisam de mais formatação — a toolbar rica do RichTextEditor permanece no modo foco | |
| Você decide | O agente escolhe o comportamento mais adequado | |

**User's choice:** Idêntico ao prontuário
**Notes:** Same behavior for consistency.

---

## Largura ~70ch e tipografia

| Option | Description | Selected |
|--------|-------------|----------|
| Centralizado na tela | Editor fica no centro com margens simétricas. Visual mais calmo e editorial, tipo Medium/Substack | ✓ |
| Alinhado à esquerda | Container limita a ~70ch mas alinha à esquerda. Mais tradicional, menos movimento visual | |
| Você decide | O agente escolhe o layout mais calmo | |

**User's choice:** Centralizado na tela
**Notes:** Editorial calm layout.

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, aumentar levemente | De 16px para 17px ou 18px no modo foco. Maior conforto para escrita prolongada | ✓ |
| Não, manter tamanho padrão | 16px já é o tamanho base. Mudança de fonte pode ser disruptiva | |
| Você decide | O agente escolhe o tamanho mais adequado | |

**User's choice:** Sim, aumentar levemente
**Notes:** Larger font for prolonged writing comfort.

| Option | Description | Selected |
|--------|-------------|----------|
| Manter 1.75 atual | O RichTextEditor já usa 1.75 e o textarea do prontuário 1.6. Manter como está | ✓ |
| Aumentar para 1.8 no modo foco | Mais respiro entre linhas para conforto em sessões longas de escrita | |
| Você decide | O agente escolhe o valor mais adequado | |

**User's choice:** Manter 1.75 atual
**Notes:** Already optimal for prolonged reading.

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas o editor | Só o textarea/RichTextEditor é limitado a ~70ch. Campos opcionais e formulários mantêm largura normal | |
| Todo o conteúdo da página | Todos os elementos de conteúdo (editor + campos + toolbar) são centralizados em ~70ch para consistência visual | ✓ |
| Você decide | O agente escolhe o escopo mais adequado | |

**User's choice:** Todo o conteúdo da página
**Notes:** Full page content consistency within comfortable reading width.

---

## the agent's Discretion

- Tamanho exato do aumento de fonte no modo foco
- Decisão sobre aplicar ~70ch ao RichTextEditor de documentos formais
- Implementação da toolbar minimalista (quais botões específicos mostrar/esconder)
- CSS exato da classe `.focus-mode` e transições de layout

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 45-calm-ux-modo-foco-tipografia*
*Discussion completed: 2026-04-27*
