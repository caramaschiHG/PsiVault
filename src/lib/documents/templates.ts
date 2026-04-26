/**
 * Document content template factory.
 *
 * buildDocumentContent returns pre-filled Portuguese prose for each supported
 * document type. Phase 5 (finance) will enrich the receipt template with
 * real payment data; for now the amount field uses a placeholder.
 *
 * Security policy (SECU-05):
 * - These templates produce document content — they must never be called from
 *   audit, log, or any surface that might store their output outside the
 *   document vault.
 */

import type { DocumentType } from "./model";

export interface DocumentSection {
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
}

export interface DocumentTemplate {
  type: DocumentType;
  mode: "free" | "structured";
  sections: DocumentSection[];
}

export interface PatientRecordSummaryEntry {
  sessionLabel: string;
  sessionDateLabel: string;
  demand?: string | null;
  observedMood?: string | null;
  themes?: string | null;
  clinicalEvolution?: string | null;
  nextSteps?: string | null;
  freeTextExcerpt?: string | null;
}

export interface DocumentPreFillContext {
  patientFullName: string;
  professionalName: string;
  crp: string;
  todayLabel: string;
  sessionCount?: number | null;
  sessionDateRange?: string | null;
  intakeDate?: string | null;
  amountLabel?: string | null;
  paymentMethod?: string | null;
  patientRecordSummaryEntries?: PatientRecordSummaryEntry[] | null;
  appointmentDateLabel?: string | null;
  appointmentTimeLabel?: string | null;
  appointmentCareModeLabel?: string | null;
  singleSessionDateLabel?: string | null;
}

function signatureBlock(professionalName: string, crp: string, todayLabel: string): string {
  return `\n\nProfissional: ${professionalName} — ${crp}\nData: ${todayLabel}`;
}

function buildDeclarationOfAttendance(ctx: DocumentPreFillContext): string {
  if (ctx.singleSessionDateLabel) {
    const timePart = ctx.appointmentTimeLabel ? `, ${ctx.appointmentTimeLabel}` : "";
    return `DECLARAÇÃO DE COMPARECIMENTO

Atendimento de ${ctx.singleSessionDateLabel}${timePart}.

Declaramos que ${ctx.patientFullName} compareceu à consulta de psicologia realizada por ${ctx.professionalName} (${ctx.crp}).

Esta declaração é fornecida para os fins que se fizerem necessários.${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
  }

  const sessionLine =
    ctx.sessionCount != null
      ? `Total de ${ctx.sessionCount} sessões`
      : "Total de ________ sessões";

  const dateRangeLine =
    ctx.sessionDateRange != null
      ? `Período: ${ctx.sessionDateRange}`
      : "Período: ________ a ________";

  return `DECLARAÇÃO DE COMPARECIMENTO

Declaramos que ${ctx.patientFullName} compareceu às consultas de psicologia realizadas por ${ctx.professionalName} (${ctx.crp}).

${sessionLine}.
${dateRangeLine}.

Esta declaração é fornecida para os fins que se fizerem necessários.${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildReceipt(ctx: DocumentPreFillContext): string {
  const amount = ctx.amountLabel ?? "R$ ________";
  const payment = ctx.paymentMethod ?? "________";

  return `RECIBO DE PAGAMENTO

Recebi de ${ctx.patientFullName} a quantia de ${amount} referente à prestação de serviços de psicologia.

Profissional: ${ctx.professionalName} — ${ctx.crp}
Forma de pagamento: ${payment}
Data: ${ctx.todayLabel}

Valor: ${amount}${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildAnamnesis(ctx: DocumentPreFillContext): string {
  const intakeDate = ctx.intakeDate ?? "________";

  return `<h2>ANAMNESE PSICOLÓGICA</h2>
<p>Paciente: ${ctx.patientFullName}<br>Profissional responsável: ${ctx.professionalName} (${ctx.crp})<br>Data de início do atendimento: ${intakeDate}</p>
<h2>I. IDENTIFICAÇÃO</h2>
<p>Nome completo: ${ctx.patientFullName}<br>Data de início: ${intakeDate}</p>
<h2>II. QUEIXA PRINCIPAL</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>III. HISTÓRIA DO PROBLEMA ATUAL</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>IV. HISTÓRIA PESSOAL E FAMILIAR</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>V. HISTÓRICO DE SAÚDE</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>VI. OBSERVAÇÕES CLÍNICAS</h2>
<p>[A ser preenchido pelo profissional]</p>
<p>Profissional: ${ctx.professionalName} — ${ctx.crp}<br>Data: ${ctx.todayLabel}</p>`;
}

function buildPsychologicalReport(ctx: DocumentPreFillContext): string {
  return `<h2>LAUDO PSICOLÓGICO</h2>
<p>Profissional: ${ctx.professionalName}<br>Registro profissional: ${ctx.crp}<br>Avaliado(a): ${ctx.patientFullName}<br>Data: ${ctx.todayLabel}</p>
<h2>I. IDENTIFICAÇÃO</h2>
<p>Nome: ${ctx.patientFullName}<br>Profissional responsável: ${ctx.professionalName} (${ctx.crp})</p>
<h2>II. OBJETIVO DO LAUDO</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>III. PROCEDIMENTOS UTILIZADOS</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>IV. RESULTADOS E ANÁLISE</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>V. CONCLUSÃO</h2>
<p>[A ser preenchido pelo profissional]</p>
<p>Este laudo foi elaborado com base em avaliação psicológica realizada conforme as normas do Conselho Federal de Psicologia.</p>
<p>Profissional: ${ctx.professionalName} — ${ctx.crp}<br>Data: ${ctx.todayLabel}</p>`;
}

function buildConsentAndServiceContract(ctx: DocumentPreFillContext): string {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS

Partes contratantes:

CONTRATADO(A): ${ctx.professionalName}, psicólogo(a), ${ctx.crp}.
CONTRATANTE: ${ctx.patientFullName}.

Data de início: ${ctx.todayLabel}

CLÁUSULA 1 — OBJETO DO CONTRATO
O(A) profissional se compromete a prestar serviços de psicologia ao(à) contratante, conforme as normas éticas do Conselho Federal de Psicologia.

CLÁUSULA 2 — SIGILO PROFISSIONAL
Todas as informações compartilhadas durante os atendimentos são protegidas pelo sigilo profissional, conforme o Código de Ética do Psicólogo.

CLÁUSULA 3 — FREQUÊNCIA E DURAÇÃO
[A ser preenchido pelo profissional]

CLÁUSULA 4 — HONORÁRIOS
[A ser preenchido pelo profissional]

CLÁUSULA 5 — CANCELAMENTO E REAGENDAMENTO
[A ser preenchido pelo profissional]

CLÁUSULA 6 — CONSENTIMENTO INFORMADO
O(A) contratante declara ter lido e compreendido este contrato e consente com os termos aqui estabelecidos.

Assinatura do(a) contratante: ________________________
Assinatura do(a) profissional: ________________________${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildSessionNote(ctx: DocumentPreFillContext): string {
  const dateLine = ctx.appointmentDateLabel
    ? `Data da sessão: ${ctx.appointmentDateLabel}`
    : `Data da sessão: ${ctx.todayLabel}`;
  const careModeLine = ctx.appointmentCareModeLabel
    ? `<br>Modalidade: ${ctx.appointmentCareModeLabel}`
    : "";

  return `<h2>EVOLUÇÃO DE SESSÃO</h2>
<p>Paciente: ${ctx.patientFullName}<br>Profissional: ${ctx.professionalName} (${ctx.crp})<br>${dateLine}${careModeLine}</p>
<h2>I. OBJETIVOS DA SESSÃO</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>II. CONTEÚDO E INTERVENÇÕES</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>III. EVOLUÇÃO E OBSERVAÇÕES</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>IV. PRÓXIMA SESSÃO</h2>
<p>Data prevista: ________<br>Objetivos para a próxima sessão: [A ser preenchido pelo profissional]</p>
<p>Profissional: ${ctx.professionalName} — ${ctx.crp}<br>Data: ${ctx.todayLabel}</p>`;
}

function buildSessionRecord(): string {
  return "";
}

function buildReferralLetter(ctx: DocumentPreFillContext): string {
  return `<h2>CARTA DE ENCAMINHAMENTO</h2>
<p>${ctx.todayLabel}</p>
<p>À(Ao) colega especialista,</p>
<p>Encaminho para avaliação e acompanhamento o(a) paciente ${ctx.patientFullName}, que tem sido atendido(a) sob minha responsabilidade.</p>
<h2>I. MOTIVO DO ENCAMINHAMENTO</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>II. HISTÓRICO CLÍNICO RESUMIDO</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>III. HIPÓTESE DIAGNÓSTICA</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>IV. TRATAMENTO EM CURSO</h2>
<p>[A ser preenchido pelo profissional]</p>
<h2>V. OBSERVAÇÕES RELEVANTES</h2>
<p>[A ser preenchido pelo profissional]</p>
<p>Coloco-me à disposição para maiores informações por meio do contato profissional.</p>
<p>Atenciosamente,<br>Profissional: ${ctx.professionalName} — ${ctx.crp}<br>Data: ${ctx.todayLabel}</p>`;
}

function buildPatientRecordSummary(ctx: DocumentPreFillContext): string {
  const entries = ctx.patientRecordSummaryEntries ?? [];

  const entryBlocks =
    entries.length > 0
      ? entries
          .map((entry) => {
            const lines = [
              `${entry.sessionLabel} — ${entry.sessionDateLabel}`,
              entry.demand ? `Demanda principal: ${entry.demand}` : null,
              entry.observedMood ? `Apresentação emocional: ${entry.observedMood}` : null,
              entry.themes ? `Temas centrais: ${entry.themes}` : null,
              entry.clinicalEvolution ? `Evolução clínica: ${entry.clinicalEvolution}` : null,
              entry.nextSteps ? `Encaminhamentos / próximos passos: ${entry.nextSteps}` : null,
              entry.freeTextExcerpt ? `Síntese complementar: ${entry.freeTextExcerpt}` : null,
            ].filter(Boolean);

            return lines.join("\n");
          })
          .join("\n\n")
      : "[Inserir síntese cronológica do acompanhamento com base no prontuário]";

  return `RESUMO DE PRONTUÁRIO PSICOLÓGICO

Paciente: ${ctx.patientFullName}
Profissional responsável: ${ctx.professionalName} (${ctx.crp})
Data de emissão: ${ctx.todayLabel}

FINALIDADE DO DOCUMENTO
Resumo clínico destinado ao compartilhamento com o(a) paciente quando necessário, mediante revisão profissional prévia.

DADOS GERAIS DO ACOMPANHAMENTO
Início do acompanhamento: ${ctx.intakeDate ?? "________"}
Período considerado: ${ctx.sessionDateRange ?? "________"}
Sessões concluídas: ${ctx.sessionCount != null ? String(ctx.sessionCount) : "________"}

SÍNTESE DO ACOMPANHAMENTO
${entryBlocks}

OBSERVAÇÕES FINAIS / ENCAMINHAMENTOS
[Revisar e complementar este resumo conforme a finalidade específica do envio]

NOTA ÉTICA
Este resumo deriva do prontuário psicológico e deve conter apenas as informações estritamente necessárias para a finalidade do compartilhamento com o(a) paciente, conforme avaliação técnica e ética da(o) profissional.${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

export const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplate> = {
  session_record: { type: "session_record", mode: "free", sections: [] },
  psychological_report: {
    type: "psychological_report",
    mode: "structured",
    sections: [
      { id: "identification", title: "I. IDENTIFICAÇÃO", placeholder: "Nome completo, data de nascimento, encaminhante...", required: false },
      { id: "objective", title: "II. OBJETIVO DO LAUDO", placeholder: "Descreva o objetivo da avaliação...", required: false },
      { id: "procedures", title: "III. PROCEDIMENTOS UTILIZADOS", placeholder: "Instrumentos e técnicas aplicadas...", required: false },
      { id: "results", title: "IV. RESULTADOS E ANÁLISE", placeholder: "Análise dos resultados obtidos...", required: false },
      { id: "conclusion", title: "V. CONCLUSÃO", placeholder: "Conclusões e encaminhamentos...", required: false },
    ],
  },
  anamnesis: {
    type: "anamnesis",
    mode: "structured",
    sections: [
      { id: "identification", title: "I. IDENTIFICAÇÃO", placeholder: "Nome, data de nascimento, ocupação...", required: false },
      { id: "chief_complaint", title: "II. QUEIXA PRINCIPAL", placeholder: "Motivo da consulta...", required: false },
      { id: "history", title: "III. HISTÓRIA DO PROBLEMA ATUAL", placeholder: "Descrição detalhada...", required: false },
      { id: "personal_family", title: "IV. HISTÓRIA PESSOAL E FAMILIAR", placeholder: "Dados relevantes...", required: false },
      { id: "health", title: "V. HISTÓRICO DE SAÚDE", placeholder: "Condições de saúde...", required: false },
      { id: "observations", title: "VI. OBSERVAÇÕES CLÍNICAS", placeholder: "Observações do profissional...", required: false },
    ],
  },
  session_note: {
    type: "session_note",
    mode: "structured",
    sections: [
      { id: "objectives", title: "I. OBJETIVOS DA SESSÃO", placeholder: "Objetivos traçados...", required: false },
      { id: "content", title: "II. CONTEÚDO E INTERVENÇÕES", placeholder: "Registro da sessão...", required: false },
      { id: "evolution", title: "III. EVOLUÇÃO E OBSERVAÇÕES", placeholder: "Observações clínicas...", required: false },
      { id: "next", title: "IV. PRÓXIMA SESSÃO", placeholder: "Planejamento...", required: false },
    ],
  },
  referral_letter: {
    type: "referral_letter",
    mode: "structured",
    sections: [
      { id: "reason", title: "I. MOTIVO DO ENCAMINHAMENTO", placeholder: "Razão do encaminhamento...", required: false },
      { id: "history", title: "II. HISTÓRICO CLÍNICO RESUMIDO", placeholder: "Resumo do histórico...", required: false },
      { id: "hypothesis", title: "III. HIPÓTESE DIAGNÓSTICA", placeholder: "Hipóteses formuladas...", required: false },
      { id: "treatment", title: "IV. TRATAMENTO EM CURSO", placeholder: "Tratamento atual...", required: false },
      { id: "observations", title: "V. OBSERVAÇÕES RELEVANTES", placeholder: "Informações complementares...", required: false },
    ],
  },
  declaration_of_attendance: { type: "declaration_of_attendance", mode: "free", sections: [] },
  receipt: { type: "receipt", mode: "free", sections: [] },
  consent_and_service_contract: { type: "consent_and_service_contract", mode: "free", sections: [] },
  patient_record_summary: { type: "patient_record_summary", mode: "free", sections: [] },
};

export function getDocumentTemplate(type: DocumentType): DocumentTemplate {
  return DOCUMENT_TEMPLATES[type];
}

export function buildDocumentContent(type: DocumentType, context: DocumentPreFillContext): string {
  switch (type) {
    case "declaration_of_attendance":
      return buildDeclarationOfAttendance(context);
    case "receipt":
      return buildReceipt(context);
    case "anamnesis":
      return buildAnamnesis(context);
    case "psychological_report":
      return buildPsychologicalReport(context);
    case "consent_and_service_contract":
      return buildConsentAndServiceContract(context);
    case "session_note":
      return buildSessionNote(context);
    case "session_record":
      return buildSessionRecord();
    case "referral_letter":
      return buildReferralLetter(context);
    case "patient_record_summary":
      return buildPatientRecordSummary(context);
  }
}
