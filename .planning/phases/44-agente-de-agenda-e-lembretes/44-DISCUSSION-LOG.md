# Phase 44: Agente de Agenda & Lembretes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 44-agente-de-agenda-e-lembretes
**Areas discussed:** Detecção de Padrões de Faltas, Otimização de Horários, Lembretes Proativos, Resumo do Dia

---

## Detecção de Padrões de Faltas

| Option | Description | Selected |
|--------|-------------|----------|
| 2 no-shows seguidos | Alerta imediato após 2 faltas consecutivas — simples, previsível | ✓ |
| 3 no-shows em 30 dias | Janela deslizante de 30 dias, independente de serem seguidos | |
| Taxa > 25% no último trimestre | Proporcional ao volume de atendimentos | |
| Você decide | Deixar a heurística flexível para ajuste futuro | |

**User's choice:** 2 no-shows seguidos
**Notes:** Threshold simples e previsível. Alerta periférico (status light), nunca modal ou popup.

---

| Option | Description | Selected |
|--------|-------------|----------|
| PatientSummaryCards + lista de pacientes | Dot discreto no card de resumo do paciente E na lista de pacientes — máxima visibilidade sem ser intrusivo | ✓ |
| Apenas no PatientSummaryCards | Só quem entra no perfil do paciente vê | |
| Apenas na lista de pacientes | Visível no glance, mas some quando entra no perfil | |
| Você decide | Definir durante implementação | |

**User's choice:** PatientSummaryCards + lista de pacientes
**Notes:** Incluiu posteriormente também o card de atendimento na agenda (day/week/month views).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dot vermelho sólido com tooltip | Cor sólida discreta (8px), tooltip ao hover explica "2 faltas consecutivas detectadas". Auto-dismiss após próximo comparecimento confirmado | ✓ |
| Dot amarelo/âmbar com badge de contagem | Menos alarmista, mostra número de faltas. Manualmente dismissível | |
| Texto discreto sem dot | Exibe "Alerta de faltas" em texto pequeno | |
| Você decide | Definir detalhes visuais durante implementação | |

**User's choice:** Dot vermelho sólido com tooltip
**Notes:** Auto-dismiss após próximo comparecimento confirmado (status `CONFIRMED` ou `COMPLETED`).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, badge sutil no card do atendimento | Card de atendimento na agenda mostra o mesmo dot vermelho — psicólogo lembra no momento da sessão | ✓ |
| Não, apenas em lista e perfil | Mantém a agenda limpa | |
| Você decide | Definir durante implementação | |

**User's choice:** Sim, badge sutil no card do atendimento
**Notes:** Alerta aparece em 3 surfaces: PatientSummaryCards, lista de pacientes, e card de atendimento na agenda.

---

## Otimização de Horários

| Option | Description | Selected |
|--------|-------------|----------|
| Horários com maior taxa de comparecimento | "Quartas 14h tem 95% de presença" — badge verde em slots ideais para este paciente | ✓ |
| Alerta em slots de risco de falta | "Segundas 9h: 40% de no-shows" — badge âmbar em slots problemáticos | |
| Ambos: ideal + risco | Badge verde nos bons, âmbar nos ruins | |
| Você decide | Definir durante implementação | |

**User's choice:** Horários com maior taxa de comparecimento
**Notes:** Badge verde indicando slots ideais, não alerta de risco.

---

| Option | Description | Selected |
|--------|-------------|----------|
| No slot vazio ao fazer novo agendamento | Quando psicólogo clica em horário vazio para agendar, badge aparece indicando se é ideal para aquele paciente | ✓ |
| No cabeçalho do dia/semana | Badge geral no topo: "Quarta é o melhor dia para este paciente" | |
| Na sidebar ao selecionar paciente | Fora da agenda: ao buscar paciente, mostra "Melhor horário: quartas 14h" | |
| Você decide | Definir durante implementação | |

**User's choice:** No slot vazio ao fazer novo agendamento
**Notes:** Contexto máximo — psicólogo vê a sugestão no momento exato de agendar.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas visual com tooltip | Badge mostra taxa de comparecimento ao hover. Clique no slot segue fluxo normal de agendamento | |
| Clicável: preenche horário sugerido | Badge é botão que auto-preenche horário no formulário de agendamento | ✓ |
| Você decide | Definir durante implementação | |

**User's choice:** Clicável: preenche horário sugerido
**Notes:** Badge funciona como atalho para preencher horário no formulário.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas histórico do paciente específico | "Este paciente comparece 95% das quartas 14h" — personalizado por paciente | ✓ |
| Histórico do paciente + padrão geral do consultório | "Quartas 14h é bom para este paciente E é horário pouco disputado" | |
| Você decide | Definir durante implementação | |

**User's choice:** Apenas histórico do paciente específico
**Notes:** Não mistura dados de outros pacientes. Requer mínimo de dados (threshold abaixo).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo 3 atendimentos | Sugestão aparece após 3 sessões | |
| Mínimo 5 atendimentos | Equilíbrio entre estabilidade e tempo de espera | ✓ |
| Mínimo 10 atendimentos | Muito estável, mas pacientes novos nunca veem sugestão | |
| Você decide | Definir durante implementação | |

**User's choice:** Mínimo 5 atendimentos
**Notes:** Threshold de 5 atendimentos para primeira sugestão.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dia da semana + faixa horária | Sugere dia e horário específicos — mais preciso | ✓ |
| Apenas dia da semana | Sugere apenas o dia — menos preciso | |
| Faixa horária independente do dia | Sugere "período do dia" | |
| Você decide | Definir durante implementação | |

**User's choice:** Dia da semana + faixa horária
**Notes:** Granularidade fina: exatamente qual dia e hora são melhores.

---

## Lembretes Proativos

| Option | Description | Selected |
|--------|-------------|----------|
| Mock/skeleton primeiro | Pipeline completo com "mock sender" que loga no console/grava no banco. Integração real em fase futura | ✓ |
| Integração real via API de SMS | Twilio ou similar — lembretes reais desde o primeiro deploy | |
| Apenas notificação in-app no PsiVault | Paciente recebe lembrete apenas se logar no sistema | |
| Você decide | Definir durante implementação | |

**User's choice:** Mock/skeleton primeiro, integração real depois
**Notes:** Pipeline completo com mock sender. Integração real (Twilio/WhatsApp) é v2.1+.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Um lembrete por paciente, agregando todos os atendimentos do dia | "Você tem 2 atendimentos hoje: 10h e 14h" — um SMS/WhatsApp por paciente | ✓ |
| Um lembrete por atendimento | "Lembrete: atendimento às 10h" + "Lembrete: atendimento às 14h" | |
| Você decide | Definir durante implementação | |

**User's choice:** Um lembrete por paciente, agregando todos os atendimentos do dia
**Notes:** Batch diário: uma mensagem por paciente com todos os atendimentos do dia seguinte.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas para o paciente | Lembrete chega no celular do paciente — objetivo é reduzir faltas | ✓ |
| Paciente + psicólogo | Ambos recebem | |
| Você decide | Definir durante implementação | |

**User's choice:** Apenas para o paciente
**Notes:** Psicólogo já sabe da própria agenda.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Noite anterior (20h) + Patient ganha campo `reminderPhone` e `preferredReminderTime` | Paciente recebe à noite anterior com horário configurável. Adicionar campos ao Patient model | ✓ |
| Manhã do dia (7h) + Patient ganha apenas `reminderPhone` | Lembrete pela manhã, sem configurar horário | |
| Sem preferência: sempre 24h antes do atendimento | Um lembrete por atendimento, 24h antes — sem batch diário | |
| Você decide | Definir durante implementação | |

**User's choice:** Noite anterior (20h) + Patient ganha campo `reminderPhone` e `preferredReminderTime`
**Notes:** Default 20h, configurável por paciente via `preferredReminderTime`.

---

## Resumo do Dia

| Option | Description | Selected |
|--------|-------------|----------|
| Quando o último atendimento do dia é marcado COMPLETED | Trigger imediato após completar última sessão | ✓ |
| Cron às 22h independente de atendimentos | Sempre às 22h — previsível | |
| Ambos: trigger COMPLETED + fallback cron 22h | Aparece ao completar última sessão, mas se não marcar, aparece às 22h | |
| Você decide | Definir durante implementação | |

**User's choice:** Quando o último atendimento do dia é marcado COMPLETED
**Notes:** Natural ao workflow do psicólogo. Risco: falha se esquecer de marcar atendimento como completo.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Notificação no sino de notificações (dropdown) | Aparece como item no dropdown do sino — não intrusivo | ✓ |
| Página dedicada /dashboard/resumo | Página própria com layout rico | |
| Modal ao completar última sessão | Aparece automaticamente ao marcar último atendimento | |
| Você decide | Definir durante implementação | |

**User's choice:** Notificação no sino de notificações (dropdown)
**Notes:** Título: "Resumo do dia — {data}". Não intrusivo, respeita hierarquia Calm.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas output do Agenda Agent (faltas, lembretes enviados, sugestões) | Escopo fechado: só agenda | ✓ |
| Output de todos os agentes ativos | Extensível: inclui output de outros agentes futuros | |
| Você decide | Definir durante implementação | |

**User's choice:** Apenas output do Agenda Agent
**Notes:** Escopo fechado para esta fase. Extensível para outros agentes no futuro.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Persiste como notificação lida no histórico | Fica no dropdown do sino como "lida" — remove automaticamente após 7 dias | ✓ |
| Some após ser visto/fechado | Ephemeral — some do dropdown após interação | |
| Você decide | Definir durante implementação | |

**User's choice:** Persiste como notificação lida no histórico
**Notes:** Permite revisitar. Auto-remove após 7 dias.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Não — só aparece se houver pelo menos 1 atendimento no dia | Sem atendimento = sem resumo | ✓ |
| Sim, com mensagem "Nenhum atendimento hoje" | Sempre aparece | |
| Você decide | Definir durante implementação | |

**User's choice:** Não — só aparece se houver pelo menos 1 atendimento no dia
**Notes:** Evita notificação vazia/spam.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas o psicólogo (account que criou os atendimentos) | Resumo é pessoal — cada psicólogo vê apenas seus próprios atendimentos | ✓ |
| Todos os membros do workspace | Qualquer pessoa do workspace vê o resumo completo | |
| Você decide | Definir durante implementação | |

**User's choice:** Apenas o psicólogo (account que criou os atendimentos)
**Notes:** Alinhado com escopo workspace + account.

---

## Agent's Discretion

- Estratégia exata de cálculo da taxa de comparecimento
- Formato exato da mensagem de lembrete mock
- CSS exato do dot vermelho
- Estrutura do payload JSON para cada tipo de tarefa do Agenda Agent
- Lógica exata para detectar "último atendimento do dia"
- Estratégia de persistência do Resumo do Dia no notification storage
- Schema migration para campos `reminderPhone` e `preferredReminderTime`

## Deferred Ideas

- Integração real WhatsApp/SMS (Twilio) — v2.1+
- Integração Google Calendar/Outlook — v2.1+
- Previsão de cancelamento com ML — v2.1+
- Resumo do Dia com output de outros agentes — futuro
- Plugin system para agentes de terceiros — v2.1+
- Push notifications real-time — v2.2+
- Lembretes para psicólogo — futuro

---

*Phase: 44-agente-de-agenda-e-lembretes*
*Discussion completed: 2026-04-27*
