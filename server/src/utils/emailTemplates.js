export const verificationEmail = ({ name, url }) => ({
  subject: 'Confirm your email',
  html: `<p>Hi ${name || ''},</p>
  <p>Thanks for signing up. Please confirm your email by clicking the link below:</p>
  <p><a href="${url}">Verify Email</a></p>
  <p>If you did not sign up, ignore this email.</p>`
});

export const blockedEmail = ({ name }) => ({
  subject: 'Your account has been blocked',
  html: `<p>Hi ${name || ''},</p>
  <p>Your account has been blocked by an administrator. If you believe this is a mistake, please contact support.</p>`
});

export const blockedAttemptEmail = ({ name }) => ({
  subject: 'Blocked account login attempt',
  html: `<p>Hi ${name || ''},</p>
  <p>You have been blocked by the administrator. Do not try to log in again. Please contact the admin for assistance.</p>`
});

export const loginAttemptEmail = ({ name, success }) => ({
  subject: `Login ${success ? 'successful' : 'attempt detected'}`,
  html: `<p>Hi ${name || ''},</p>
  <p>A login ${success ? 'was successful' : 'attempt occurred'} on your account. If this wasn't you, please reset your password and contact support.</p>`
});
