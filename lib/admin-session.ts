const encoder = new TextEncoder();

function toBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createAdminSession(email: string, secret: string) {
  const payload = toBase64Url(JSON.stringify({ email: email.toLowerCase(), exp: Date.now() + 12 * 60 * 60 * 1000, nonce: crypto.randomUUID() }));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(payload)));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function readAdminSession(value: string, secret: string) {
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature || !secret) return null;
    const valid = await crypto.subtle.verify("HMAC", await key(secret), fromBase64Url(signature), encoder.encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { email?: string; exp?: number };
    return data.email && data.exp && data.exp > Date.now() ? { email: data.email.toLowerCase(), exp: data.exp } : null;
  } catch { return null; }
}

export function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}
