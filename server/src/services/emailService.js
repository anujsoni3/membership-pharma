import { getTransporter } from '../config/mail.js';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const sendMail = async ({ to, subject, html }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  if (nodemailer.getTestMessageUrl && process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Email preview URL:', preview);
  }
};
