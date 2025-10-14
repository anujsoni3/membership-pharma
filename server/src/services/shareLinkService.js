import crypto from 'crypto';
import dayjs from 'dayjs';
import { ShareLink } from '../models/ShareLink.js';

export const createShareLink = async (userId, days = 1) => {
  const token = crypto.randomBytes(16).toString('hex');
  const expires_at = dayjs().add(days, 'day').toDate();
  return ShareLink.create({ user_id: userId, token, expires_at, status: 'active' });
};

export const expireOldLinks = async () => {
  const now = new Date();
  await ShareLink.updateMany({ status: 'active', expires_at: { $lte: now } }, { $set: { status: 'expired' } });
};
