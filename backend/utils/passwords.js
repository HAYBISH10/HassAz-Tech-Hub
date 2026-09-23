import bcrypt from "bcryptjs";

const MIN_LENGTH = 8;

export function validatePasswordPair(password, confirmPassword) {
  const value = String(password || "");
  const confirm = String(confirmPassword || "");
  if (value.length < MIN_LENGTH) {
    return "Password must be at least 8 characters.";
  }
  if (value !== confirm) {
    return "Password and confirm password do not match.";
  }
  return "";
}

export async function hashPassword(password) {
  return bcrypt.hash(String(password), 12);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(String(password || ""), passwordHash);
}
