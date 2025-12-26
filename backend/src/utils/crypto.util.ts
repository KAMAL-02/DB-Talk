import crypto from "crypto";
import { config } from "../plugins/config.plugin.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const SECRET = config.REDIS_ENCRYPTION_SECRET;

if (!SECRET) {
  throw new Error("REDIS_ENCRYPTION_SECRET is not set");
}

const KEY = crypto.createHash("sha256").update(SECRET).digest();


export function encryptObject<T extends object>(data: T): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const plaintext = Buffer.from(JSON.stringify(data), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptObject<T>(payload: any): T {
  const buffer = Buffer.from(payload, "base64");

  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = buffer.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}
