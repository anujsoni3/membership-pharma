import nodemailer from 'nodemailer';
import { env } from './env.js';

let cachedTransporter = null;

export const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // Production: Use SendGrid SMTP
  if (env.SENDGRID_API_KEY) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,       // TLS
      secure: false,   // false for TLS
      auth: {
        user: 'apikey',          // literally 'apikey'
        pass: env.SENDGRID_API_KEY,
      },
    });
    return cachedTransporter;
  }

  // Dev: fallback to Ethereal
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
