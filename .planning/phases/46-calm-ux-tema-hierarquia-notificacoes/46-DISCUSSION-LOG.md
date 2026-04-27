# Phase 46: Calm UX — Tema & Hierarquia de Notificações - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 46-calm-ux-tema-hierarquia-notificacoes
**Areas discussed:** Comportamento do tema padrão, Definição de 'sessão em andamento', Mecanismo de bloqueio de interrupções, Escopo da auditoria WCAG

---

## Comportamento do tema padrão

| Option | Description | Selected |
|--------|-------------|----------|
| Remover completamente | Só light/dark. Opção 'Sistema' some da UI e do código. | |
| Manter como terceira opção | Mudar default para 'light', mas usuário ainda pode escolher 'Sistema'. | ✓ |
| Remover da UI mas manter no código | Settings mostra só light/dark. Código ainda lê 'system' como fallback. | |

**User's choice:** Manter como terceira opção
**Notes:** Default muda de "system" para "light", mas página /settings/aparencia continua oferecendo 3 opções.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle só entre light/dark | Comportamento atual. Clica = alterna entre os dois modos fixos. | ✓ |
| Ciclo light → dark → system → light | Toggle passa pelos 3 modos. Cada clique avança no ciclo. | |
| Toggle desabilitado em 'system' | Toggle só funciona quando tema já é light/dark. | |

**User's choice:** Toggle só entre light/dark
**Notes:** Toggle rápido ignora "system" e só alterna entre light e dark.

---

## Definição de 'sessão em andamento'

| Option | Description | Selected |
|--------|-------------|----------|
| Baseado em horário | Automático pelo horário do atendimento CONFIRMED. Zero UI nova. | ✓ |
| Ação explícita do usuário | Botão 'Iniciar sessão'. Preciso, mas exige novo hábito. | |
| Focus mode ativo | Reaproveita modo foco existente. Só funciona quando está escrevendo. | |
| Híbrido: horário + ação explícita | Default por horário, com override manual. Mais robusto. | |

**User's choice:** Baseado em horário
**Notes:** Sessão ativa = current time entre startsAt e endsAt de atendimento CONFIRMED.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sem margem — exato | Só bloqueia durante o horário agendado. | |
| Margem de ±5 minutos | Começa 5min antes e termina 5min depois. | ✓ |
| Margem de ±10 minutos | Mais folga, mas janela maior sem interrupções. | |

**User's choice:** Margem de ±5 minutos
**Notes:** Considera sessão ativa de startsAt-5min até endsAt+5min.

---

## Mecanismo de bloqueio de interrupções

| Option | Description | Selected |
|--------|-------------|----------|
| Só modais/popups | Bloqueia apenas o mais intrusivo. Dropdown ainda funciona. | ✓ |
| Modais + dropdowns | Bloqueia popup e dropdown do sino. Badges e status lights ainda aparecem. | |
| Tudo exceto status light | Durante sessão, só indicadores periféricos discretos. | |

**User's choice:** Só modais/popups
**Notes:** Dropdowns de notificações, badges e status lights continuam funcionando normalmente.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Fila + exibe após sessão | Modal é adiado e aparece automaticamente quando sessão termina. | ✓ |
| Convertido para notificação no dropdown | Vira notificação silenciosa no sino. | |
| Suprimido silenciosamente | Modal não aparece. | |
| Vai para 'Resumo do Dia' | Item no batch pós-sessão. | |

**User's choice:** Fila + exibe após sessão
**Notes:** Modais bloqueados vão para fila e são exibidos automaticamente após término da sessão.

---

## Escopo da auditoria WCAG

| Option | Description | Selected |
|--------|-------------|----------|
| Todo o app | Audita todas as páginas e componentes. | ✓ |
| Só componentes afetados por esta fase | Foca em hover, placeholders, disabled. | |
| Todo o app, mas priorizado | Começa por hover/placeholder/disabled, expande se houver tempo. | |

**User's choice:** Todo o app
**Notes:** Auditoria WCAG 2.1 AA cobre todo o app, não só componentes desta fase.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Automatizado com axe-core | Rápido e objetivo. | ✓ |
| Checklist manual + ferramenta de contraste | Mais lento, mas pega nuances. | |
| Híbrido: axe-core + manual | Baseline automatizado + revisão manual para edge cases. | |

**User's choice:** Automatizado com axe-core
**Notes:** axe-core executado em ambos os temas (light e dark).

---

## Claude's Discretion

- Estratégia de migração de usuários existentes com "system" salvo no localStorage
- Implementação exata do mecanismo de fila de modais bloqueados
- Integração do axe-core no projeto (script, teste, ou CI)
- Detalhes de como forçar tema dark durante execução dos testes axe
- Se a detecção de sessão em andamento deve ser cliente ou servidor

## Deferred Ideas

- Status IN_PROGRESS para atendimentos
- Botão "Iniciar sessão" explícito
- Plugin de axe-core no CI
- Notificações server-side persistentes
