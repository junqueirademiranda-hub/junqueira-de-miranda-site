import { getAccessToken, getDriveConfig, isAdmin } from "../_lib";

export async function GET(request: Request) {
  if (!await isAdmin(request)) return new Response("Acesso não autorizado.", { status: 403 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const name = (url.searchParams.get("name") || "documento").replace(/[\r\n"]/g, "").slice(0, 150);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return new Response("Arquivo inválido.", { status: 400 });
  try {
    const token = await getAccessToken(await getDriveConfig());
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok || !response.body) return new Response("Não foi possível visualizar o arquivo.", { status: response.status });
    const type = response.headers.get("content-type") || "application/octet-stream";
    return new Response(response.body, { headers: { "content-type": type, "content-disposition": `inline; filename="${name}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Erro na visualização.", { status: 500 });
  }
}
