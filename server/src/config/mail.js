import nodemailer from 'nodemailer';
import { env } from './env.js';

let cachedTransporter = null;

export const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // If SMTP env provided, use it
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    return cachedTransporter;
  }

  // Dev: Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
};
