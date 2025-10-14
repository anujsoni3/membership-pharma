export const isValidUsername = (v) => /^[a-zA-Z0-9]{3,}$/.test(v);
export const isValidPassword = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(v);
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
