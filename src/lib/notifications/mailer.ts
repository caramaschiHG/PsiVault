import nodemailer from "nodemailer";
import type { WorkspaceSmtpConfig } from "./smtp-config";
import { decryptSmtpPassword } from "./crypto";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  smtpConfig: WorkspaceSmtpConfig,
  options: SendEmailOptions,
): Promise<void> {
  const password = decryptSmtpPassword(smtpConfig.passwordCiphertext);

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: password,
    },
  });

  await transporter.sendMail({
    from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function verifySmtpConnection(smtpConfig: WorkspaceSmtpConfig): Promise<void> {
  const password = decryptSmtpPassword(smtpConfig.passwordCiphertext);

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: password,
    },
  });

  await transporter.verify();
}
