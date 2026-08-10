import { driveJson, getAccessToken, getDriveConfig, isAdmin } from "../_lib";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

function safeName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._ -]/g, "").trim().slice(0, 100);
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const clientName = safeName(String(form.get("clientName") || "Cliente"));
  if (!(file instanceof File) || !file.size) return Response.json({ error: "Selecione um arquivo." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return Response.json({ error: "Envie somente PDF, JPG ou PNG." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "O arquivo excede o limite de 10 MB." }, { status: 400 });
  try {
    const config = await getDriveConfig();
    const token = await getAccessToken(config);
    const escaped = clientName.replace(/'/g, "\\'");
    const query = encodeURIComponent(`name='${escaped}' and '${config.root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const found = await driveJson<{ files?: Array<{ id: string }> }>(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`, token);
    let folderId = found.files?.[0]?.id;
    if (!folderId) {
      const create = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ name: clientName, mimeType: "application/vnd.google-apps.folder", parents: [config.root_folder_id] }),
      });
      const folder = await create.json() as { id?: string };
      folderId = folder.id;
    }
    if (!folderId) throw new Error("Não foi possível criar a pasta da cliente.");
    const boundary = `portal_${crypto.randomUUID()}`;
    const metadata = JSON.stringify({ name: safeName(file.name), parents: [folderId] });
    const prefix = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`;
    const suffix = `\r\n--${boundary}--`;
    const body = new Blob([prefix, await file.arrayBuffer(), suffix]);
    const upload = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
      method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": `multipart/related; boundary=${boundary}` }, body,
    });
    const uploaded = await upload.json() as { id?: string; name?: string; webViewLink?: string; error?: { message?: string } };
    if (!upload.ok || !uploaded.id) throw new Error(uploaded.error?.message || "Falha no envio ao Google Drive.");
    return Response.json({ ok: true, name: uploaded.name, folder: clientName });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro inesperado no envio." }, { status: 500 });
  }
}
