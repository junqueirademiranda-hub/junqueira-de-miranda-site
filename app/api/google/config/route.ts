import { db, encrypt, ensureTables, isAdmin } from "../_lib";

export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  const payload = await request.json() as { clientId?: string; clientSecret?: string };
  const clientId = payload.clientId?.trim() || "";
  const clientSecret = payload.clientSecret?.trim() || "";
  if (!clientId.endsWith(".apps.googleusercontent.com") || !clientSecret) {
    return Response.json({ error: "ID ou segredo OAuth inválido." }, { status: 400 });
  }
  await ensureTables();
  await (await db()).prepare(`INSERT INTO google_drive_config
    (id, client_id, client_secret_encrypted, updated_at) VALUES (1, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET client_id=excluded.client_id,
    client_secret_encrypted=excluded.client_secret_encrypted,
    refresh_token_encrypted=NULL, root_folder_id=NULL, connected_email=NULL,
    updated_at=excluded.updated_at`)
    .bind(clientId, await encrypt(clientSecret), new Date().toISOString()).run();
  return Response.json({ ok: true });
}
