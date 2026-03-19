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
}

function signatureBlock(professionalName: string, crp: string, todayLabel: string): string {
  return `\n\nProfissional: ${professionalName} — ${crp}\nData: ${todayLabel}`;
}

function buildDeclarationOfAttendance(ctx: DocumentPreFillContext): string {
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

  return `ANAMNESE PSICOLÓGICA

Paciente: ${ctx.patientFullName}
Profissional responsável: ${ctx.professionalName} (${ctx.crp})
Data de início do atendimento: ${intakeDate}

I. IDENTIFICAÇÃO
Nome completo: ${ctx.patientFullName}
Data de início: ${intakeDate}

II. QUEIXA PRINCIPAL
[A ser preenchido pelo profissional]

III. HISTÓRIA DO PROBLEMA ATUAL
[A ser preenchido pelo profissional]

IV. HISTÓRIA PESSOAL E FAMILIAR
[A ser preenchido pelo profissional]

V. HISTÓRICO DE SAÚDE
[A ser preenchido pelo profissional]

VI. OBSERVAÇÕES CLÍNICAS
[A ser preenchido pelo profissional]${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildPsychologicalReport(ctx: DocumentPreFillContext): string {
  return `LAUDO PSICOLÓGICO

Profissional: ${ctx.professionalName}
Registro profissional: ${ctx.crp}
Avaliado(a): ${ctx.patientFullName}
Data: ${ctx.todayLabel}

I. IDENTIFICAÇÃO
Nome: ${ctx.patientFullName}
Profissional responsável: ${ctx.professionalName} (${ctx.crp})

II. OBJETIVO DO LAUDO
[A ser preenchido pelo profissional]

III. PROCEDIMENTOS UTILIZADOS
[A ser preenchido pelo profissional]

IV. RESULTADOS E ANÁLISE
[A ser preenchido pelo profissional]

V. CONCLUSÃO
[A ser preenchido pelo profissional]

Este laudo foi elaborado com base em avaliação psicológica realizada conforme as normas do Conselho Federal de Psicologia.${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
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
  return `EVOLUÇÃO DE SESSÃO

Paciente: ${ctx.patientFullName}
Profissional: ${ctx.professionalName} (${ctx.crp})
Data da sessão: ${ctx.todayLabel}

————————————————————

I. OBJETIVOS DA SESSÃO
[A ser preenchido pelo profissional]

II. CONTEÚDO E INTERVENÇÕES
[A ser preenchido pelo profissional]

III. EVOLUÇÃO E OBSERVAÇÕES
[A ser preenchido pelo profissional]

IV. PRÓXIMA SESSÃO
Data prevista: ________
Objetivos para a próxima sessão: [A ser preenchido pelo profissional]${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildPsychoanalyticCaseStudy(ctx: DocumentPreFillContext): string {
  return `ESTUDO DE CASO PSICANALÍTICO

Profissional: ${ctx.professionalName} (${ctx.crp})
Data do registro: ${ctx.todayLabel}

I. IDENTIFICAÇÃO DO CASO
Caso (iniciais ou código): ________
Período de acompanhamento considerado: ${ctx.sessionDateRange ?? "________"}

II. MOTIVO DA ESCRITA / RECORTE DO CASO
[Delimitar o motivo da formalização do caso, o ponto de impasse clínico ou o eixo de interesse para supervisão e elaboração]

III. APRESENTAÇÃO DA DEMANDA
[Descrever como a demanda comparece no discurso do paciente e na cena analítica]

IV. HISTÓRIA E CONTEXTO
[Registrar elementos biográficos, familiares e contextuais relevantes para a leitura do caso]

V. DINÂMICA TRANSFERENCIAL E CONTRATRANSFERENCIAL
[Anotar movimentos transferenciais, incidências no vínculo e efeitos clínicos percebidos pelo analista]

VI. FORMAÇÕES DO INCONSCIENTE E ELEMENTOS RECORRENTES
[Registrar sonhos, atos falhos, repetições, lapsos, fantasias, sintomas e significantes recorrentes]

VII. HIPÓTESES CLÍNICAS
[Elaborar hipóteses provisórias, conflitos centrais, defesas predominantes e organização psíquica]

VIII. DIREÇÃO DO TRATAMENTO
[Indicar manejo, orientação da escuta, intervenções possíveis e pontos de acompanhamento]

IX. OBSERVAÇÕES ÉTICAS E DE SIGILO
Este registro deve preservar o sigilo clínico e evitar identificação direta do paciente, privilegiando iniciais, código do caso e supressão de detalhes desnecessários.${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
}

function buildReferralLetter(ctx: DocumentPreFillContext): string {
  return `CARTA DE ENCAMINHAMENTO

${ctx.todayLabel}

À(Ao) colega especialista,

Encaminho para avaliação e acompanhamento o(a) paciente ${ctx.patientFullName}, que tem sido atendido(a) sob minha responsabilidade.

I. MOTIVO DO ENCAMINHAMENTO
[A ser preenchido pelo profissional]

II. HISTÓRICO CLÍNICO RESUMIDO
[A ser preenchido pelo profissional]

III. HIPÓTESE DIAGNÓSTICA
[A ser preenchido pelo profissional]

IV. TRATAMENTO EM CURSO
[A ser preenchido pelo profissional]

V. OBSERVAÇÕES RELEVANTES
[A ser preenchido pelo profissional]

————————————————————

Coloco-me à disposição para maiores informações por meio do contato profissional.

Atenciosamente,${signatureBlock(ctx.professionalName, ctx.crp, ctx.todayLabel)}`;
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
    case "case_study_psychoanalytic":
      return buildPsychoanalyticCaseStudy(context);
    case "referral_letter":
      return buildReferralLetter(context);
  }
}
