import { db, ensureTables, getAccessToken, getDriveConfig, isAdmin } from "../_lib";

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  await ensureTables();
  const row = await (await db()).prepare("SELECT client_id, connected_email, root_folder_id FROM google_drive_config WHERE id=1").first<Record<string, string>>();
  let emailEnabled = false;
  if (row?.root_folder_id) {
    try {
      const token = await getAccessToken(await getDriveConfig());
      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: { authorization: `Bearer ${token}` } });
      emailEnabled = response.ok;
    } catch {}
  }
  return Response.json({ configured: Boolean(row?.client_id), connected: Boolean(row?.root_folder_id), emailEnabled, email: row?.connected_email || null });
}
