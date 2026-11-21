import crypto from "crypto";
import { env } from "../config/env";

const encryptionKey = Buffer.from(env.ENCRYPTION_KEY, "hex");
const passportHashKey = Buffer.from(env.PASSPORT_HASH_KEY, "hex");

/** AES-256-GCM envelope: base64(iv):base64(tag):base64(ciphertext). */
export function encryptPassport(plainValue: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainValue, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptPassport(envelope: string): string {
  const [ivPart, tagPart, dataPart] = envelope.split(":");
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Invalid passport encryption envelope");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(ivPart, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** Normalisation makes the blind index stable across formatting differences. */
export function normalizePassport(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function blindIndexPassport(value: string): string {
  return crypto
    .createHmac("sha256", passportHashKey)
    .update(normalizePassport(value))
    .digest("hex");
}

/** List views only show the first character and last two characters. */
export function maskPassport(value: string): string {
  const normalized = value.trim();
  if (normalized.length <= 3) return "*".repeat(normalized.length);
  return `${normalized[0]}${"*".repeat(Math.max(1, normalized.length - 3))}${normalized.slice(-2)}`;
}
