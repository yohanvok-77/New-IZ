import bcrypt from "bcryptjs";

const PASSWORD_MIN_LENGTH = 8;

export function isValidPassword(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
