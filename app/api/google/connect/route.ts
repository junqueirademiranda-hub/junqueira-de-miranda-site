import { db, ensureTables, isAdmin, redirectUri } from "../_lib";

export async function GET(request: Request) {
  if (!await isAdmin(request)) return new Response("Acesso não autorizado.", { status: 403 });
  await ensureTables();
  const database = await db();
  const config = await database.prepare("SELECT client_id FROM google_drive_config WHERE id=1").first<{ client_id: string }>();
  if (!config) return new Response("Configure a credencial primeiro.", { status: 400 });
  const state = crypto.randomUUID();
  await database.prepare("INSERT INTO google_oauth_state (state, expires_at) VALUES (?, ?)").bind(state, Date.now() + 10 * 60 * 1000).run();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return Response.redirect(url.toString(), 302);
}
