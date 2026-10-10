import { createChallenge, randomInt, verifySolution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import type { Challenge, Payload } from "altcha-lib/types";
export const MAX_MESSAGE = 8000;
export const MAX_REQUEST_BYTES = 40000;
export const RETENTION_DAYS = 30;
export const PROOF_SECONDS = 300;
const COST = 5000;
const SCOPE = "quietbox-message-v1";
export class SubmissionError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function requireSecret(secret?: string): string {
  if (!secret || secret.length < 32) throw new SubmissionError(503, "Արկղը դեռ պատրաստ չէ։ Փորձեք ավելի ուշ։");
  return secret;
}
export async function makeChallenge(secret: string): Promise<Challenge> {
  return createChallenge({
    algorithm: "PBKDF2/SHA-256", cost: COST, counter: randomInt(400, 800), deriveKey,
    expiresAt: new Date(Date.now() + PROOF_SECONDS * 1000),
    hmacSignatureSecret: requireSecret(secret), data: { scope: SCOPE },
  });
}
export function sameOrigin(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function boundedJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new SubmissionError(415, "Հաղորդագրությունն ուղարկեք կայքի ձևի միջոցով։");
  const reader = request.body?.getReader();
  if (!reader) throw new SubmissionError(400, "Հաղորդագրությունը բացակայում է։");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new SubmissionError(413, "Հաղորդագրությունը չափազանց երկար է։ Գրեք առավելագույնը 8 000 նիշ։");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new SubmissionError(400, "Չհաջողվեց կարդալ հաղորդագրությունը։ Փորձեք կրկին։"); }
}
export function messageText(data: Record<string, unknown>): string {
  const allowed = new Set(["message", "proof", "website"]);
  if (Object.keys(data).some((key) => !allowed.has(key))) throw new SubmissionError(400, "Հարցումը պարունակում է չնախատեսված տվյալներ։ Օգտագործեք հաղորդագրության ձևը։");
  if (data.website !== "" || typeof data.message !== "string") throw new SubmissionError(400, "Չհաջողվեց ընդունել հաղորդագրությունը։ Փորձեք կրկին։");
  const body = data.message.trim();
  if (!body || body.length > MAX_MESSAGE || body.includes("\u0000")) throw new SubmissionError(400, "Գրեք 1-ից 8 000 նիշ պարունակող հաղորդագրություն։");
  return body;
}
export async function checkProof(proof: unknown, secret: string, now = Date.now()): Promise<{signature: string; expiresAt: number}> {
  const invalid = () => new SubmissionError(400, "Կրկին անցեք սպամի ստուգումը։");
  if (typeof proof !== "string" || proof.length > 5000) throw invalid();
  let payload: Payload;
  try { payload = JSON.parse(atob(proof)); } catch { throw invalid(); }
  const p = payload?.challenge?.parameters;
  const solution = payload?.solution;
  // Bound attacker-controlled work before verification.
  if (!p || p.algorithm !== "PBKDF2/SHA-256" || p.cost !== COST || p.keyLength !== 32 ||
      p.keyPrefix?.length !== 32 || !/^[a-f0-9]+$/.test(p.keyPrefix) ||
      typeof p.salt !== "string" || p.salt.length > 128 || typeof p.nonce !== "string" || p.nonce.length > 128 ||
      !Number.isInteger(p.expiresAt) || p.expiresAt! <= now / 1000 || p.expiresAt! > now / 1000 + PROOF_SECONDS + 5 ||
      p.data?.scope !== SCOPE || !solution || !Number.isInteger(solution.counter) || solution.counter < 0 || solution.counter >= 800 ||
      typeof solution.derivedKey !== "string" || !/^[a-f0-9]{64}$/.test(solution.derivedKey) ||
      typeof payload.challenge.signature !== "string" || !/^[a-f0-9]{64}$/.test(payload.challenge.signature)) throw invalid();
  try {
    const result = await verifySolution({ challenge: payload.challenge, solution, deriveKey, hmacSignatureSecret: requireSecret(secret) });
    if (!result.verified) throw invalid();
  } catch { throw invalid(); }
  return { signature: payload.challenge.signature, expiresAt: p.expiresAt! };
}
export function storedMessage(body: string, now = Date.now()) {
  return { id: crypto.randomUUID(), body, day: new Date(now).toISOString().slice(0, 10), is_read: 0 };
}
export function cleanupStatements(db: D1Database, now = Date.now()): D1PreparedStatement[] {
  const cutoff = new Date(now - RETENTION_DAYS * 86400000).toISOString().slice(0, 10);
  return [
    db.prepare("DELETE FROM messages WHERE day <= ?").bind(cutoff),
    db.prepare("DELETE FROM used_proofs WHERE expires_at < ?").bind(Math.floor(now / 1000)),
    db.prepare("DELETE FROM limits WHERE expires_at < ?").bind(Math.floor(now / 1000)),
  ];
}
export async function saveSubmission(db: D1Database, body: string, proof: { signature: string; expiresAt: number }, now = Date.now()) {
  const row = storedMessage(body, now);
  const minute = Math.floor(now / 60000), day = Math.floor(now / 86400000);
  const counter = (bucket: string, capacity: number, expires: number) => db.prepare(
    "INSERT INTO limits (bucket, count, capacity, expires_at) VALUES (?, 1, ?, ?) ON CONFLICT(bucket) DO UPDATE SET count = count + 1"
  ).bind(bucket, capacity, expires);
  try {
    // D1 batch is transactional: replay or quota failures roll back the whole submission.
    await db.batch([
      ...cleanupStatements(db, now),
      db.prepare("INSERT INTO used_proofs (signature, expires_at) VALUES (?, ?)").bind(proof.signature, proof.expiresAt),
      counter(`minute:${minute}`, 30, (minute + 2) * 60), counter(`day:${day}`, 500, (day + 2) * 86400),
      db.prepare("INSERT INTO messages (id, body, day, is_read) VALUES (?, ?, ?, 0)").bind(row.id, row.body, row.day),
    ]);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason.includes("used_proofs")) throw new SubmissionError(409, "Այս ստուգումն արդեն օգտագործվել է։ Անցեք նոր ստուգում։");
    if (reason.includes("within_capacity")) throw new SubmissionError(429, "Արկղը ծանրաբեռնված է։ Փորձեք ավելի ուշ։");
    throw new SubmissionError(503, "Չհաջողվեց պահել հաղորդագրությունը։ Փորձեք կրկին։");
  }
}
