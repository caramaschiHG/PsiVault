/**
 * Communication template URL builders.
 *
 * Builds WhatsApp deep-links (wa.me) and mailto: URLs with pre-filled
 * Portuguese messages for common psychologist-patient communication scenarios.
 *
 * Phone formatting:
 * - Strip all non-digit characters from patientPhone
 * - Prepend "55" Brazilian country code
 * - When patientPhone is null/undefined, phone part is empty (WhatsApp prompts user)
 */

// ---------------------------------------------------------------------------
// Phone formatting
// ---------------------------------------------------------------------------

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `55${digits}`;
}

// ---------------------------------------------------------------------------
// WhatsApp URL builder
// ---------------------------------------------------------------------------

function buildWhatsAppUrl(phone: string | null | undefined, text: string): string {
  const formattedPhone = formatPhone(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
// Mailto URL builder
// ---------------------------------------------------------------------------

function buildMailtoUrl(
  email: string | null | undefined,
  subject: string,
  body: string,
): string {
  const recipient = email ?? "";
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---------------------------------------------------------------------------
// Reminder
// ---------------------------------------------------------------------------

export interface ReminderMessageContext {
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  appointmentDate: string;
  appointmentTime: string;
}

export function buildReminderWhatsAppUrl(ctx: ReminderMessageContext): string {
  const text =
    `Olá, ${ctx.patientName}! Lembrando da sua consulta agendada para ${ctx.appointmentDate} às ${ctx.appointmentTime}. Qualquer dúvida, estou à disposição!`;
  return buildWhatsAppUrl(ctx.patientPhone, text);
}

export function buildReminderMailtoUrl(ctx: ReminderMessageContext): string {
  const subject = `Lembrete de consulta — ${ctx.appointmentDate}`;
  const body =
    `Olá, ${ctx.patientName}!\n\nEste é um lembrete da sua consulta agendada para ${ctx.appointmentDate} às ${ctx.appointmentTime}.\n\nQualquer dúvida, estou à disposição!\n\nAté logo,`;
  return buildMailtoUrl(ctx.patientEmail, subject, body);
}

// ---------------------------------------------------------------------------
// Reschedule
// ---------------------------------------------------------------------------

export interface RescheduleMessageContext {
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  originalDate: string;
  originalTime: string;
}

export function buildRescheduleWhatsAppUrl(ctx: RescheduleMessageContext): string {
  const text =
    `Olá, ${ctx.patientName}! Preciso reagendar a nossa consulta prevista para ${ctx.originalDate} às ${ctx.originalTime}. Podemos combinar um novo horário?`;
  return buildWhatsAppUrl(ctx.patientPhone, text);
}

export function buildRescheduleMailtoUrl(ctx: RescheduleMessageContext): string {
  const subject = `Reagendamento de consulta — ${ctx.originalDate}`;
  const body =
    `Olá, ${ctx.patientName}!\n\nPreciso reagendar a nossa consulta prevista para ${ctx.originalDate} às ${ctx.originalTime}.\n\nPodemos combinar um novo horário?\n\nAté logo,`;
  return buildMailtoUrl(ctx.patientEmail, subject, body);
}

// ---------------------------------------------------------------------------
// Document delivery
// ---------------------------------------------------------------------------

export interface DocumentDeliveryMessageContext {
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  documentType: string;
}

export function buildDocumentDeliveryWhatsAppUrl(ctx: DocumentDeliveryMessageContext): string {
  const text =
    `Olá, ${ctx.patientName}! Segue o documento "${ctx.documentType}" que preparei para você. Qualquer dúvida, estou à disposição!`;
  return buildWhatsAppUrl(ctx.patientPhone, text);
}

export function buildDocumentDeliveryMailtoUrl(ctx: DocumentDeliveryMessageContext): string {
  const subject = `Documento: ${ctx.documentType}`;
  const body =
    `Olá, ${ctx.patientName}!\n\nSegue o documento "${ctx.documentType}" que preparei para você.\n\nQualquer dúvida, estou à disposição!\n\nAté logo,`;
  return buildMailtoUrl(ctx.patientEmail, subject, body);
}
