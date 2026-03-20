/**
 * Email templates for appointment notifications.
 * All text in pt-BR. Inline styles for maximum email client compatibility.
 */

interface AppointmentEmailData {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  fromName: string;
}

function baseLayout(content: string, fromName: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:2rem 1rem;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#fffdf9;border-radius:12px;border:1px solid #e8ddd0;overflow:hidden;">
          <tr>
            <td style="background:#3d2b1a;padding:1.25rem 2rem;">
              <p style="margin:0;color:#f5ebe0;font-size:1rem;font-weight:600;letter-spacing:0.04em;">${fromName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:2rem;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:1rem 2rem;border-top:1px solid #e8ddd0;">
              <p style="margin:0;font-size:0.75rem;color:#9a8070;font-family:sans-serif;">
                Esta mensagem foi enviada automaticamente pelo PsiVault.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildConfirmationEmail(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Consulta confirmada — ${data.appointmentDate}`;
  const content = `
    <h1 style="margin:0 0 1rem;font-size:1.25rem;color:#1a0f00;font-family:Georgia,serif;">Consulta agendada</h1>
    <p style="margin:0 0 0.75rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Olá, <strong>${data.patientName}</strong>.
    </p>
    <p style="margin:0 0 1.5rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Sua consulta foi agendada com sucesso.
    </p>
    <table cellpadding="0" cellspacing="0" style="background:#f5ebe0;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;">
      <tr>
        <td>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#7c5c3a;font-family:sans-serif;">Data</p>
          <p style="margin:0;font-size:1rem;color:#1a0f00;font-weight:600;font-family:sans-serif;">${data.appointmentDate}</p>
        </td>
      </tr>
      <tr><td style="height:0.75rem;"></td></tr>
      <tr>
        <td>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#7c5c3a;font-family:sans-serif;">Horário</p>
          <p style="margin:0;font-size:1rem;color:#1a0f00;font-weight:600;font-family:sans-serif;">${data.appointmentTime}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:0.875rem;color:#6b4c30;line-height:1.6;font-family:sans-serif;">
      Em caso de dúvidas ou necessidade de reagendamento, entre em contato com o consultório.
    </p>
  `;
  return { subject, html: baseLayout(content, data.fromName) };
}

export function buildReminderEmail(data: AppointmentEmailData & { hoursAhead: 24 | 1 }): { subject: string; html: string } {
  const timeLabel = data.hoursAhead === 24 ? "amanhã" : "em 1 hora";
  const subject = `Lembrete de consulta — ${data.appointmentDate}`;
  const content = `
    <h1 style="margin:0 0 1rem;font-size:1.25rem;color:#1a0f00;font-family:Georgia,serif;">Lembrete de consulta</h1>
    <p style="margin:0 0 0.75rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Olá, <strong>${data.patientName}</strong>.
    </p>
    <p style="margin:0 0 1.5rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Este é um lembrete da sua consulta <strong>${timeLabel}</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="background:#f5ebe0;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;">
      <tr>
        <td>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#7c5c3a;font-family:sans-serif;">Data</p>
          <p style="margin:0;font-size:1rem;color:#1a0f00;font-weight:600;font-family:sans-serif;">${data.appointmentDate}</p>
        </td>
      </tr>
      <tr><td style="height:0.75rem;"></td></tr>
      <tr>
        <td>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#7c5c3a;font-family:sans-serif;">Horário</p>
          <p style="margin:0;font-size:1rem;color:#1a0f00;font-weight:600;font-family:sans-serif;">${data.appointmentTime}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:0.875rem;color:#6b4c30;line-height:1.6;font-family:sans-serif;">
      Se precisar reagendar, entre em contato com o consultório o quanto antes.
    </p>
  `;
  return { subject, html: baseLayout(content, data.fromName) };
}

export function buildCancellationEmail(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Consulta cancelada — ${data.appointmentDate}`;
  const content = `
    <h1 style="margin:0 0 1rem;font-size:1.25rem;color:#1a0f00;font-family:Georgia,serif;">Consulta cancelada</h1>
    <p style="margin:0 0 0.75rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Olá, <strong>${data.patientName}</strong>.
    </p>
    <p style="margin:0 0 1.5rem;font-size:0.95rem;color:#3d2b1a;line-height:1.6;font-family:sans-serif;">
      Sua consulta do dia <strong>${data.appointmentDate}</strong> às <strong>${data.appointmentTime}</strong> foi cancelada.
    </p>
    <p style="margin:0;font-size:0.875rem;color:#6b4c30;line-height:1.6;font-family:sans-serif;">
      Para agendar uma nova consulta, entre em contato com o consultório.
    </p>
  `;
  return { subject, html: baseLayout(content, data.fromName) };
}
