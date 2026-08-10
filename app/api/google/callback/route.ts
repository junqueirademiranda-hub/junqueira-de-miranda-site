import { db, decrypt, encrypt, ensureTables, redirectUri } from "../_lib";
import { createAdminSession } from "../../../../lib/admin-session";

export async function GET(request: Request) {
  await ensureTables();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return new Response("Autorização incompleta.", { status: 400 });
  const database = await db();
  const adminState = await database.prepare("SELECT expires_at FROM admin_oauth_state WHERE state=?").bind(state).first<{ expires_at: number }>();
  if (adminState) {
    await database.prepare("DELETE FROM admin_oauth_state WHERE state=?").bind(state).run();
    if (adminState.expires_at < Date.now()) return new Response("Autorização expirada. Tente novamente.", { status: 400 });
    const config = await database.prepare("SELECT client_id, client_secret_encrypted FROM google_drive_config WHERE id=1").first<{ client_id: string; client_secret_encrypted: string }>();
    if (!config) return new Response("Credencial Google ausente.", { status: 503 });
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.client_id, client_secret: await decrypt(config.client_secret_encrypted), redirect_uri: redirectUri, grant_type: "authorization_code" }) });
    const token = await tokenResponse.json() as { access_token?: string; error_description?: string };
    if (!tokenResponse.ok || !token.access_token) return new Response(token.error_description || "Não foi possível entrar com o Google.", { status: 400 });
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
    const user = await userResponse.json() as { email?: string; verified_email?: boolean };
    const { env } = await import("cloudflare:workers");
    const email = (user.email || "").toLowerCase();
    const allowed = String(env.ADMIN_EMAILS || "").toLowerCase().split(",").map((item: string) => item.trim());
    if (!userResponse.ok || !email || user.verified_email === false || !allowed.includes(email)) return new Response("Esta conta Google não tem autorização para acessar o painel.", { status: 403 });
    const session = await createAdminSession(email, String(env.GOOGLE_CONFIG_ENCRYPTION_KEY || ""));
    return new Response(null, { status: 302, headers: { location: new URL("/portal/admin", request.url).toString(), "set-cookie": `portal_admin=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200` } });
  }
  const stateRow = await database.prepare("SELECT expires_at FROM google_oauth_state WHERE state=?").bind(state).first<{ expires_at: number }>();
  await database.prepare("DELETE FROM google_oauth_state WHERE state=?").bind(state).run();
  if (!stateRow || stateRow.expires_at < Date.now()) return new Response("Autorização expirada. Tente novamente.", { status: 400 });
  const config = await database.prepare("SELECT client_id, client_secret_encrypted FROM google_drive_config WHERE id=1").first<{ client_id: string; client_secret_encrypted: string }>();
  if (!config) return new Response("Credencial ausente.", { status: 400 });
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: config.client_id, client_secret: await decrypt(config.client_secret_encrypted), redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string; error_description?: string };
  if (!tokenResponse.ok || !token.access_token || !token.refresh_token) return new Response(token.error_description || "Não foi possível concluir a autorização.", { status: 400 });
  const query = encodeURIComponent("name='PORTAL_CLIENTES_TESTE' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const existingResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&pageSize=1`, { headers: { authorization: `Bearer ${token.access_token}` } });
  const existing = await existingResponse.json() as { files?: Array<{id:string}> };
  let folderId = existing.files?.[0]?.id;
  if (!folderId) {
    const folderResponse = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", { method: "POST", headers: { authorization: `Bearer ${token.access_token}`, "content-type": "application/json" }, body: JSON.stringify({ name: "PORTAL_CLIENTES_TESTE", mimeType: "application/vnd.google-apps.folder" }) });
    const folder = await folderResponse.json() as { id?: string };
    folderId = folder.id;
  }
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
  const user = await userResponse.json() as { email?: string };
  if (!folderId) return new Response("O Google autorizou, mas a pasta de teste não pôde ser localizada.", { status: 400 });
  await database.prepare(`UPDATE google_drive_config SET refresh_token_encrypted=?, root_folder_id=?, connected_email=?, updated_at=? WHERE id=1`)
    .bind(await encrypt(token.refresh_token), folderId, user.email || "Conta Google autorizada", new Date().toISOString()).run();
  return Response.redirect(new URL("/portal/admin?drive=connected", request.url).toString(), 302);
}
