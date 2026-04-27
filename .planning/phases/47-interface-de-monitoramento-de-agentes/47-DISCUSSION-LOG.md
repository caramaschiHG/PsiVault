# Phase 47: Interface de Monitoramento de Agentes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 47-interface-de-monitoramento-de-agentes
**Areas discussed:** Mapeamento de status online/offline/paused

---

## Mapeamento de status online/offline/paused

| Option | Description | Selected |
|--------|-------------|----------|
| Por config do workspace | online = habilitado + intensidade normal; offline = desabilitado ou intensidade off; paused = intensidade silent. Simples e reflete o controle do usuário. | ✓ |
| Por atividade real de tarefas | online = há tarefas RUNNING recentes (últimos 15min); offline = sem tarefas recentes; paused = intensidade silent. Mais dinâmico, mas requer lógica extra. | |
| Híbrido | Status base = config do workspace, mas mostra indicador secundário 'processando' se houver tarefa RUNNING. | |
| Você decide | Deixo a critério do agente/planner escolher o mapeamento mais adequado. | |

**User's choice:** Por config do workspace (recomendado)
**Notes:** Usuário preferiu simplicidade e controle explícito. O mapeamento é: online = enabled=true + intensity=normal; paused = enabled=true + intensity=silent; offline = enabled=false OR intensity=off OR agent not registered.

---

## the agent's Discretion

- Visualização de logs recentes (formato, quantidade, campos)
- Controle de intensidade (padrão de interação, salvamento automático vs botão)
- Estado vazio e onboarding (mensagem quando nenhum agente habilitado)
- Layout exato da lista de agentes
- Indicador secundário de tarefa em execução (RUNNING)
- Cores e ícones para cada status
- Responsividade mobile da tela de agentes

## Deferred Ideas

- Indicador de tarefa em execução no momento como feature primária
- Controle global de intensidade que afeta todos os agentes
- Ordenação/filtro avançado de logs
- Notificações push quando agente muda de status
- Plugin system para agentes de terceiros
