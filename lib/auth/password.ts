import "server-only";

import bcrypt from "bcryptjs";

const PASSWORD_HASH_ROUNDS = 12;
const MINIMUM_PASSWORD_LENGTH = 8;
const MAXIMUM_PASSWORD_LENGTH = 128;

export function validatePassword(password: string): void {
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new Error(
      `Password must contain at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
    );
  }

  if (password.length > MAXIMUM_PASSWORD_LENGTH) {
    throw new Error(
      `Password cannot exceed ${MAXIMUM_PASSWORD_LENGTH} characters.`,
    );
  }
}

export async function hashPassword(
  password: string,
): Promise<string> {
  validatePassword(password);

  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (
    !password ||
    !passwordHash ||
    password.length > MAXIMUM_PASSWORD_LENGTH
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}