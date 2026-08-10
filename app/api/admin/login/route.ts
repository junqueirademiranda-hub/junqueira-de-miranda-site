import { db, ensureGoogleClientConfig, ensureTables, redirectUri } from "../../google/_lib";

export async function GET() {
  await ensureTables();
  const database = await db();
  const config = await ensureGoogleClientConfig();
  if (!config?.client_id) return new Response("A integração com o Google ainda não está configurada.", { status: 503 });
  const state = crypto.randomUUID();
  await database.prepare("INSERT INTO admin_oauth_state (state, expires_at) VALUES (?, ?)").bind(state, Date.now() + 10 * 60 * 1000).run();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.client_id);
  url.searchParams.set("redirect_uri", await redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  return Response.redirect(url.toString(), 302);
}
