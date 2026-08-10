import { isAdmin, db, sendPortalEmail } from "../../../google/_lib";
import { ensureRequestTables, hashToken, newToken } from "../../_lib";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  await ensureRequestTables(); const { id } = await context.params; const database = await db();
  const original = await database.prepare("SELECT client_name,client_email FROM document_requests WHERE id=?").bind(id).first<{client_name:string;client_email:string}>();
  if (!original) return Response.json({ error: "Solicitação não encontrada." }, { status: 404 });
  const corrections = await database.prepare(`SELECT d.label,r.notes FROM request_documents d JOIN document_reviews r ON r.request_document_id=d.id
    WHERE d.request_id=? AND r.status='correction' ORDER BY d.position`).bind(id).all<{label:string;notes:string}>();
  if (!corrections.results.length) return Response.json({ error: "Nenhum documento foi marcado para correção." }, { status: 400 });
  const newId=crypto.randomUUID(); const token=newToken(); const now=new Date().toISOString();
  const instructions=corrections.results.map(item=>`• ${item.label}`).join("\n")+"\n\nObservações: "+corrections.results.map(item=>`${item.label}: ${item.notes}`).join(" | ");
  await database.prepare(`INSERT INTO document_requests (id,client_name,client_email,instructions,token_hash,status,expires_at,created_at) VALUES (?,?,?,?,?,'open',?,?)`)
    .bind(newId,original.client_name,original.client_email,instructions,await hashToken(token),Date.now()+72*3600000,now).run();
  await database.batch(corrections.results.map((item,position)=>database.prepare("INSERT INTO request_documents (id,request_id,label,position) VALUES (?,?,?,?)").bind(crypto.randomUUID(),newId,item.label,position)));
  const link=`${new URL(request.url).origin}/portal/acesso/${token}`; let emailSent=false; let emailError="";
  try { await sendPortalEmail(original.client_email,"Junqueira de Miranda - complemento de documentos",`Olá, ${original.client_name}.\n\nO escritório solicita o reenvio de alguns documentos. Utilize o link seguro abaixo para consultar as orientações e enviar somente os itens indicados.\n\nAcesse: ${link}\n\nNão encaminhe este link a terceiros.\n\nJunqueira de Miranda Advocacia`); emailSent=true; } catch(error){emailError=error instanceof Error?error.message:"Falha no envio do e-mail.";}
  return Response.json({ link, emailSent, emailError }, { status: 201 });
}
