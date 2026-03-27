// Password hashing helpers using bcrypt.
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  // Always hash passwords before storing them.
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  // Compare a plain password with the stored hash.
  return bcrypt.compare(plainPassword, passwordHash);
}
