# Milestone v2.0 Requirements

## Multi-Agent Architecture & Calm UX

---

## Overview

Transformar o PsiVault de uma ferramenta passiva de registro em uma plataforma com agentes inteligentes especializados que operam em background, reduzindo carga cognitiva do psicólogo e aplicando princípios de Calm Technology e UX evidence-based.

---

## Requirements

### Agente de Agenda & Lembretes

- [ ] **AGEND-01**: Sistema detecta padrões de faltas e no-shows por paciente e exibe alerta periférico (status light) no card do paciente, nunca como modal ou popup
- [ ] **AGEND-02**: Agente envia lembretes proativos para pacientes via WhatsApp/SMS com batching diário, respeitando horário de preferência do paciente
- [ ] **AGEND-03**: Agente sugere otimização de horários baseada em histórico de disponibilidade do psicólogo e padrões de comparecimento dos pacientes
- [ ] **AGEND-04**: Notificações de agenda são agrupadas em "Resumo do Dia" exibido após o último atendimento do dia, nunca durante sessão

### Calm UX & Accessibility

- [ ] **CALM-01**: Modo foco para escrita clínica que oculta sidebar, top-bar e notificações, exibindo apenas editor e identificação mínima do paciente
- [ ] **CALM-02**: Editor de notas clínicas com largura máxima de ~70ch para conforto de leitura e escrita prolongada
- [ ] **CALM-03**: Light mode como tema padrão; dark mode disponível como toggle manual explícito (não automático por preferência do OS)
- [ ] **CALM-04**: Hierarquia de interrupção documentada e implementada: status light > badge > dropdown > modal; regra de ouro: nenhum popup durante sessão em andamento
- [ ] **CALM-05**: Revisão de contraste em hover states, placeholders e elementos desabilitados para garantir WCAG 2.1 AA em ambos os temas

### Arquitetura Multi-Agent

- [ ] **ARCH-01**: Sistema de orquestração onde cada agente opera em contexto isolado com própria fila de tarefas e lifecycle independente
- [ ] **ARCH-02**: Priorização de interrupções por agente: crítico (segurança) > alto (falta iminente) > médio (lembrete) > baixo (resumo)
- [ ] **ARCH-03**: Fallback graceful quando offline: local cache para ações pendentes, retry queue com backoff exponencial, sync automático na reconexão
- [ ] **ARCH-04**: Interface de monitoramento de agentes em /settings/agentes mostrando status, logs recentes, configuração de intensidade (desligado/silencioso/normal)

---

## Future Requirements

- **AGEND-05**: Integração com Google Calendar/Outlook para sync bidirecional de horários
- **AGEND-06**: Previsão de cancelamento com ML baseada em histórico do paciente
- **CALM-06**: Customização de densidade visual (compacto/padrão/espacioso)
- **CALM-07**: Fonte ajustável pelo usuário (tamanho e família)
- **ARCH-05**: Plugin system para agentes de terceiros
- **ARCH-06**: Agente de Pesquisa Psicanalítica (v2.1+)
- **ARCH-07**: Agente de Documentação (auto-preenchimento, transcrição) (v2.1+)

---

## Out of Scope

- **Pesquisa Psicanalítica**: Sumarização de obras, bibliografias, comparação de escolas — diferenciador para v2.1, requer modelo de linguagem e curadoria especializada
- **Transcrição de sessões**: Requer consentimento explícito do paciente, infraestrutura de áudio, e compliance LGPD adicional
- **Auto-preenchimento de notas**: Requer modelo de linguagem treinado em dados clínicos, risco de alucinação em contexto médico
- **Notificações push real-time**: Infraestrutura adicional (Supabase real-time, service workers) — v2.2+
- **Integração bancária/Open Finance**: Risco de segurança alto, complexidade regulatória

---

## Traceability

| Requirement | Phase | Plan | Status |
|-------------|-------|------|--------|
| AGEND-01 | — | — | Pending |
| AGEND-02 | — | — | Pending |
| AGEND-03 | — | — | Pending |
| AGEND-04 | — | — | Pending |
| CALM-01 | — | — | Pending |
| CALM-02 | — | — | Pending |
| CALM-03 | — | — | Pending |
| CALM-04 | — | — | Pending |
| CALM-05 | — | — | Pending |
| ARCH-01 | — | — | Pending |
| ARCH-02 | — | — | Pending |
| ARCH-03 | — | — | Pending |
| ARCH-04 | — | — | Pending |

---

*Last updated: 2026-04-27*
