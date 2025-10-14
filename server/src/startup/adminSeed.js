import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const ensureAdminSeed = async () => {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return;
  const password_hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await User.create({
    username: env.ADMIN_USERNAME,
    email: env.ADMIN_EMAIL,
    password_hash,
    email_verified: true,
    is_blocked: false,
    role: 'admin',
    full_name: 'Administrator'
  });
  console.log('Seeded admin account:', env.ADMIN_EMAIL);
};
