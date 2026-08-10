import { driveJson, getAccessToken, getDriveConfig, isAdmin } from "../_lib";

type DriveFile = { id: string; name: string; mimeType: string; size?: string; createdTime?: string };

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  try {
    const config = await getDriveConfig();
    const token = await getAccessToken(config);
    const folderQuery = encodeURIComponent(`'${config.root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const folders = await driveJson<{ files: DriveFile[] }>(`https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name)&orderBy=name`, token);
    const files = (await Promise.all(folders.files.map(async (folder) => {
      const query = encodeURIComponent(`'${folder.id}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`);
      const result = await driveJson<{ files: DriveFile[] }>(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,createdTime)&orderBy=createdTime desc`, token);
      return result.files.map((file) => ({ ...file, clientName: folder.name }));
    }))).flat();
    return Response.json({ files });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao consultar documentos." }, { status: 500 });
  }
}
