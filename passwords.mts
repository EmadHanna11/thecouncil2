import { randomBytes, scrypt as derive, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(derive);
const OPTIONS = { N: 65536, r: 8, p: 2, maxmem: 128 * 1024 * 1024 };
export const validPassword = (v: unknown): v is string => typeof v === "string" && v.length >= 10 && v.length <= 128;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64, OPTIONS) as Buffer;
  return `scrypt-v1$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, record: string | undefined) {
  const parts = (record || "").split("$");
  const valid = parts.length === 3 && parts[0] === "scrypt-v1" &&
    /^[a-f0-9]{32}$/.test(parts[1]) && /^[a-f0-9]{128}$/.test(parts[2]);
  // Equal-cost derivation for unknown accounts avoids a fast account-existence
  // signal. Salt/cost/version are bounded; never accept parameters from clients.
  const salt = valid ? parts[1] : "0".repeat(32);
  const expected = Buffer.from(valid ? parts[2] : "0".repeat(128), "hex");
  const actual = await scrypt(password, salt, 64, OPTIONS) as Buffer;
  return valid && timingSafeEqual(actual, expected);
}