import { db } from "../google/_lib";

const encoder = new TextEncoder();
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}
export async function ensureRequestTables() {
  const database = await db();
  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS document_requests (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      instructions TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'open',
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      submitted_at TEXT
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS request_files (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      drive_file_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(request_id) REFERENCES document_requests(id)
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS request_documents (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      label TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY(request_id) REFERENCES document_requests(id)
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS request_document_files (
      request_document_id TEXT NOT NULL,
      file_id TEXT NOT NULL UNIQUE,
      PRIMARY KEY(request_document_id, file_id),
      FOREIGN KEY(request_document_id) REFERENCES request_documents(id),
      FOREIGN KEY(file_id) REFERENCES request_files(id)
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS document_reviews (
      request_document_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      notes TEXT,
      reviewed_at TEXT NOT NULL,
      FOREIGN KEY(request_document_id) REFERENCES request_documents(id)
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL UNIQUE,
      drive_file_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(request_id) REFERENCES document_requests(id)
    )`),
  ]);
}
export type RequestRow = { id: string; client_name: string; client_email: string; instructions: string; status: string; expires_at: number; created_at: string; submitted_at?: string | null };
export async function validRequest(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  await ensureRequestTables();
  return (await db()).prepare("SELECT * FROM document_requests WHERE token_hash=?").bind(await hashToken(token)).first<RequestRow>();
}
