import { driveJson, getAccessToken, getDriveConfig } from "../../../google/_lib";
import { db } from "../../../google/_lib";
import { validRequest } from "../../../requests/_lib";

const allowed = new Set(["application/pdf","image/jpeg","image/png","image/webp","image/heic","image/heif"]);
function safe(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._ -]/g,"").trim().slice(0,100); }
export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const row = await validRequest(token);
  if (!row) return Response.json({ error: "Link inválido." }, { status: 404 });
  if (row.status !== "open" || row.expires_at < Date.now()) return Response.json({ error: "Esta solicitação não aceita novos arquivos." }, { status: 410 });
  const form = await request.formData(); const file = form.get("file");
  const requestDocumentId = String(form.get("documentId") || "");
  if (!(file instanceof File) || !allowed.has(file.type) || !file.size || file.size > 10*1024*1024) return Response.json({ error: "Envie PDF ou uma foto com até 10 MB." }, { status: 400 });
  const database = await db();
  const requestedDocument = await database.prepare("SELECT id,label FROM request_documents WHERE id=? AND request_id=?").bind(requestDocumentId,row.id).first<{id:string;label:string}>();
  if (!requestedDocument) return Response.json({ error: "Selecione o documento correto antes de enviar." }, { status: 400 });
  try {
    const config=await getDriveConfig(); const access=await getAccessToken(config); const escaped=row.client_name.replace(/'/g,"\\'");
    const q=encodeURIComponent(`name='${escaped}' and '${config.root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const found=await driveJson<{files:Array<{id:string}>}>(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`,access); let folderId=found.files[0]?.id;
    if(!folderId){const response=await fetch("https://www.googleapis.com/drive/v3/files?fields=id",{method:"POST",headers:{authorization:`Bearer ${access}`,"content-type":"application/json"},body:JSON.stringify({name:row.client_name,mimeType:"application/vnd.google-apps.folder",parents:[config.root_folder_id]})});const folder=await response.json() as {id?:string};folderId=folder.id;}
    if(!folderId) throw new Error("Não foi possível preparar a pasta da cliente.");
    const boundary=`portal_${crypto.randomUUID()}`; const name=safe(`${requestedDocument.label} - ${file.name}`); const metadata=JSON.stringify({name,parents:[folderId]});
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`,await file.arrayBuffer(),`\r\n--${boundary}--`]);
    const response=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",{method:"POST",headers:{authorization:`Bearer ${access}`,"content-type":`multipart/related; boundary=${boundary}`},body}); const uploaded=await response.json() as {id?:string;name?:string;error?:{message?:string}};
    if(!response.ok||!uploaded.id) throw new Error(uploaded.error?.message||"Falha no envio.");
    const fileId=crypto.randomUUID();
    await database.batch([
      database.prepare("INSERT INTO request_files (id,request_id,drive_file_id,file_name,mime_type,size,created_at) VALUES (?,?,?,?,?,?,?)").bind(fileId,row.id,uploaded.id,uploaded.name||name,file.type,file.size,new Date().toISOString()),
      database.prepare("INSERT INTO request_document_files (request_document_id,file_id) VALUES (?,?)").bind(requestDocumentId,fileId),
    ]);
    return Response.json({ok:true,name:uploaded.name||name});
  } catch(error){return Response.json({error:error instanceof Error?error.message:"Erro no envio."},{status:500});}
}
