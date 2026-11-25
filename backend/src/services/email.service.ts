import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export async function sendArtisanRejectionEmail(email: string, artisanName: string, reason: string): Promise<void> {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPassword || !env.smtpFrom || !Number.isInteger(env.smtpPort) || env.smtpPort < 1) {
    throw new AppError(503, 'O envio de e-mails não está configurado. Configure SMTP antes de reprovar cadastros.');
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  });

  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: 'Atualização sobre seu cadastro de artesão na artpop',
    text: `Olá, ${artisanName}.\n\nSeu cadastro de artesão não foi aprovado neste momento.\n\nMotivo informado pela curadoria: ${reason}\n\nVocê pode entrar em contato com a equipe da artpop caso tenha dúvidas.`,
  });
}
