import { driveJson, getAccessToken, getDriveConfig, isAdmin } from "../_lib";

type DriveFile = { id: string; name: string; mimeType: string };
const encoder = new TextEncoder();
function u16(value: number) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, value, true); return b; }
function u32(value: number) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, value >>> 0, true); return b; }
function crc32(bytes: Uint8Array) { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let i=0;i<8;i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ 0xffffffff) >>> 0; }
function safe(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 140); }
function makeZip(entries: Array<{ name: string; data: Uint8Array }>) {
  const parts: BlobPart[] = [], central: BlobPart[] = []; let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(safe(entry.name)); const crc = crc32(entry.data); const size = entry.data.byteLength;
    const local = new Blob([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(name.length),u16(0),name,entry.data]);
    parts.push(local);
    central.push(new Blob([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));
    offset += local.size;
  }
  const centralBlob = new Blob(central); const end = new Blob([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralBlob.size),u32(offset),u16(0)]);
  return new Blob([...parts,centralBlob,end], { type: "application/zip" });
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) return new Response("Acesso não autorizado.", { status: 403 });
  const client = new URL(request.url).searchParams.get("client")?.trim() || "";
  if (!client) return new Response("Cliente não informado.", { status: 400 });
  try {
    const config = await getDriveConfig(); const token = await getAccessToken(config);
    const escaped = client.replace(/'/g, "\\'");
    const folderQuery = encodeURIComponent(`name='${escaped}' and '${config.root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const folders = await driveJson<{ files: Array<{ id: string }> }>(`https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id)&pageSize=1`, token);
    const folderId = folders.files[0]?.id; if (!folderId) return new Response("Pasta da cliente não encontrada.", { status: 404 });
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`);
    const result = await driveJson<{ files: DriveFile[] }>(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&orderBy=name`, token);
    if (!result.files.length) return new Response("A cliente ainda não possui documentos.", { status: 404 });
    const entries = await Promise.all(result.files.map(async (file) => {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`, { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Falha ao baixar ${file.name}.`);
      return { name: file.name, data: new Uint8Array(await response.arrayBuffer()) };
    }));
    const zip = makeZip(entries);
    return new Response(zip.stream(), { headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${safe(client)}_documentos.zip"`, "cache-control": "private, no-store" } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Erro ao gerar ZIP.", { status: 500 });
  }
}
