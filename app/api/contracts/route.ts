import { db, driveJson, getAccessToken, getDriveConfig, isAdmin, sendPortalEmail } from "../google/_lib";
import { ensureRequestTables, hashToken, newToken } from "../requests/_lib";
import { upsertClient } from "../clients/_lib";

function safe(value:string){return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._ -]/g,"").trim().slice(0,120);}

export async function GET(request:Request){
  if(!await isAdmin(request)) return Response.json({error:"Acesso não autorizado."},{status:401});
  await ensureRequestTables(); const database=await db();
  const rows=await database.prepare(`SELECT c.id,c.request_id,c.file_name,c.size,c.created_at,r.client_name,r.client_email,r.status,r.expires_at,
    (SELECT COUNT(*) FROM request_files f WHERE f.request_id=r.id) returned_count FROM contracts c JOIN document_requests r ON r.id=c.request_id ORDER BY c.created_at DESC LIMIT 30`).all();
  return Response.json({contracts:rows.results});
}

export async function POST(request:Request){
  if(!await isAdmin(request)) return Response.json({error:"Acesso não autorizado."},{status:401});
  await ensureRequestTables(); const form=await request.formData(); const file=form.get("file");
  const clientName=String(form.get("clientName")||"").trim(); const clientEmail=String(form.get("clientEmail")||"").trim().toLowerCase();
  const hours=Math.min(168,Math.max(24,Number(form.get("hours")||72))); const sendEmail=String(form.get("sendEmail"))==="true";
  if(!clientName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) return Response.json({error:"Informe nome e e-mail válidos."},{status:400});
  if(!(file instanceof File)||file.type!=="application/pdf"||!file.size||file.size>15*1024*1024) return Response.json({error:"Envie um contrato em PDF com até 15 MB."},{status:400});
  await upsertClient(clientName,clientEmail);
  try{
    const config=await getDriveConfig(); const access=await getAccessToken(config); const escaped=clientName.replace(/'/g,"\\'");
    const q=encodeURIComponent(`name='${escaped}' and '${config.root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const found=await driveJson<{files:Array<{id:string}>}>(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`,access); let folderId=found.files[0]?.id;
    if(!folderId){const response=await fetch("https://www.googleapis.com/drive/v3/files?fields=id",{method:"POST",headers:{authorization:`Bearer ${access}`,"content-type":"application/json"},body:JSON.stringify({name:clientName,mimeType:"application/vnd.google-apps.folder",parents:[config.root_folder_id]})});const folder=await response.json() as {id?:string};folderId=folder.id;}
    if(!folderId) throw new Error("Não foi possível preparar a pasta do cliente.");
    const boundary=`portal_${crypto.randomUUID()}`; const name=safe(`Contrato original - ${file.name}`); const metadata=JSON.stringify({name,parents:[folderId]});
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,await file.arrayBuffer(),`\r\n--${boundary}--`]);
    const upload=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",{method:"POST",headers:{authorization:`Bearer ${access}`,"content-type":`multipart/related; boundary=${boundary}`},body}); const uploaded=await upload.json() as {id?:string;name?:string;error?:{message?:string}};
    if(!upload.ok||!uploaded.id) throw new Error(uploaded.error?.message||"Falha ao enviar o contrato.");
    const token=newToken(), requestId=crypto.randomUUID(), documentId=crypto.randomUUID(), now=new Date().toISOString(), expiresAt=Date.now()+hours*3600000; const database=await db();
    await database.batch([
      database.prepare("INSERT INTO document_requests (id,client_name,client_email,instructions,token_hash,status,expires_at,created_at) VALUES (?,?,?,?,?,'open',?,?)").bind(requestId,clientName,clientEmail,"• Contrato assinado",await hashToken(token),expiresAt,now),
      database.prepare("INSERT INTO request_documents (id,request_id,label,position) VALUES (?,?,?,0)").bind(documentId,requestId,"Contrato assinado"),
      database.prepare("INSERT INTO contracts (id,request_id,drive_file_id,file_name,mime_type,size,created_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),requestId,uploaded.id,uploaded.name||name,"application/pdf",file.size,now),
    ]);
    const link=`${new URL(request.url).origin}/portal/acesso/${token}`; let emailSent=false,emailError="";
    if(sendEmail){try{await sendPortalEmail(clientEmail,"Contrato disponível para assinatura",`Olá, ${clientName}.\n\nO escritório Junqueira de Miranda disponibilizou seu contrato. Acesse o link abaixo para visualizar, baixar e devolver o documento assinado:\n\n${link}\n\nEste link é pessoal e válido por ${hours} horas.`);emailSent=true;}catch(error){emailError=error instanceof Error?error.message:"Falha no envio do e-mail.";}}
    return Response.json({ok:true,link,emailSent,emailError});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Não foi possível disponibilizar o contrato."},{status:500});}
}
