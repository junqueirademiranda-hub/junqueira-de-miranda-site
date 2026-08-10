const encoder = new TextEncoder();
const decoder = new TextDecoder();
import { cookieValue, readAdminSession } from "../../../lib/admin-session";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function encryptionKey() {
  const { env } = await import("cloudflare:workers");
  const raw = String(env.GOOGLE_CONFIG_ENCRYPTION_KEY || "");
  if (!raw) throw new Error("Chave de criptografia não configurada.");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encrypt(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), encoder.encode(value));
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

export async function decrypt(value: string) {
  const [iv, payload] = value.split(".");
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, await encryptionKey(), base64ToBytes(payload));
  return decoder.decode(decrypted);
}

export async function db() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  return env.DB as D1Database;
}

export async function ensureTables() {
  const database = await db();
  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS google_drive_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      client_id TEXT NOT NULL,
      client_secret_encrypted TEXT NOT NULL,
      refresh_token_encrypted TEXT,
      root_folder_id TEXT,
      connected_email TEXT,
      updated_at TEXT NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS google_oauth_state (
      state TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS admin_oauth_state (
      state TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    )`),
  ]);
}

export async function isAdmin(request: Request) {
  const { env } = await import("cloudflare:workers");
  const session = await readAdminSession(cookieValue(request, "portal_admin"), String(env.GOOGLE_CONFIG_ENCRYPTION_KEY || ""));
  const email = session?.email || "";
  const allowed = String(env.ADMIN_EMAILS || "").toLowerCase().split(",").map((item) => item.trim());
  return Boolean(email && allowed.includes(email));
}

export const redirectUri = "https://junqueirademiranda.com.br/api/google/callback";

export type DriveConfig = {
  client_id: string;
  client_secret_encrypted: string;
  refresh_token_encrypted: string;
  root_folder_id: string;
};

export async function getDriveConfig() {
  await ensureTables();
  const config = await (await db()).prepare(`SELECT client_id, client_secret_encrypted, refresh_token_encrypted, root_folder_id
    FROM google_drive_config WHERE id=1`).first<DriveConfig>();
  if (!config?.refresh_token_encrypted || !config.root_folder_id) throw new Error("Conecte o Google Drive primeiro.");
  return config;
}

export async function getAccessToken(config: DriveConfig) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.client_id,
      client_secret: await decrypt(config.client_secret_encrypted),
      refresh_token: await decrypt(config.refresh_token_encrypted),
      grant_type: "refresh_token",
    }),
  });
  const result = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !result.access_token) throw new Error(result.error_description || "A autorização do Google expirou.");
  return result.access_token;
}

export async function driveJson<T>(url: string, token: string) {
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  const result = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message || "Falha ao consultar o Google Drive.");
  return result;
}

export async function sendPortalEmail(to: string, subject: string, message: string) {
  if (!/^\S+@\S+\.\S+$/.test(to) || /[\r\n]/.test(to)) throw new Error("Destinatário de e-mail inválido.");
  const config = await getDriveConfig();
  const accessToken = await getAccessToken(config);
  const encodedSubject = bytesToBase64(encoder.encode(subject));
  const rawMessage = [`To: ${to}`, `Subject: =?UTF-8?B?${encodedSubject}?=`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: 8bit", "", message].join("\r\n");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", { method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" }, body: JSON.stringify({ raw: bytesToBase64Url(encoder.encode(rawMessage)) }) });
  const result = await response.json() as { id?: string; error?: { message?: string } };
  if (!response.ok || !result.id) throw new Error(result.error?.message || "Não foi possível enviar o e-mail.");
  return result.id;
}

export async function connectedGoogleEmail() {
  await ensureTables();
  const row = await (await db()).prepare("SELECT connected_email FROM google_drive_config WHERE id=1").first<{connected_email:string}>();
  if (!row?.connected_email) throw new Error("Conta Google do escritório não conectada.");
  return row.connected_email;
}
