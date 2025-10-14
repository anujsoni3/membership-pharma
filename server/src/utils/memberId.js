import crypto from 'crypto';

export const generateMemberId = () => {
  const base = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `MBR-${base}`;
};
