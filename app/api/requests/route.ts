import { db, isAdmin, sendPortalEmail } from "../google/_lib";
import { ensureRequestTables, hashToken, newToken } from "./_lib";
import { upsertClient } from "../clients/_lib";

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  await ensureRequestTables();
  const rows = await (await db()).prepare(`SELECT r.*, COUNT(f.id) file_count FROM document_requests r
    LEFT JOIN request_files f ON f.request_id=r.id GROUP BY r.id ORDER BY r.created_at DESC`).all();
  return Response.json({ requests: rows.results });
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  const body = await request.json() as { clientName?: string; clientEmail?: string; documents?: string[]; observations?: string; hours?: number; sendEmail?: boolean };
  const clientName = body.clientName?.trim() || ""; const clientEmail = body.clientEmail?.trim().toLowerCase() || "";
  const documents = Array.from(new Set((body.documents || []).map(item => String(item).trim()).filter(item => item.length >= 2))).slice(0, 30);
  const observations = body.observations?.trim().slice(0, 1000) || "";
  const instructions = `${documents.map(item => `• ${item}`).join("\n")}${observations ? `\n\nObservações: ${observations}` : ""}`;
  if (clientName.length < 3 || !/^\S+@\S+\.\S+$/.test(clientEmail) || !documents.length) return Response.json({ error: "Preencha nome, e-mail e selecione pelo menos um documento." }, { status: 400 });
  const hours = Math.min(168, Math.max(1, Number(body.hours) || 72));
  const id = crypto.randomUUID(); const token = newToken(); const now = new Date().toISOString();
  await ensureRequestTables();
  await upsertClient(clientName,clientEmail);
  await (await db()).prepare(`INSERT INTO document_requests (id,client_name,client_email,instructions,token_hash,status,expires_at,created_at)
    VALUES (?,?,?,?,?,'open',?,?)`).bind(id, clientName, clientEmail, instructions, await hashToken(token), Date.now() + hours * 3600000, now).run();
  const database = await db();
  await database.batch(documents.map((label, position) => database.prepare("INSERT INTO request_documents (id,request_id,label,position) VALUES (?,?,?,?)").bind(crypto.randomUUID(), id, label, position)));
  const origin = new URL(request.url).origin;
  const link = `${origin}/portal/acesso/${token}`; let emailSent=false; let emailError="";
  if (body.sendEmail !== false) { try { await sendPortalEmail(clientEmail,"Junqueira de Miranda - envio de documentos",`Olá, ${clientName}.\n\nO escritório Junqueira de Miranda disponibilizou um link seguro para o envio de documentos.\n\nAcesse: ${link}\n\nO link é individual e expira em ${hours} horas. Não encaminhe esta mensagem a terceiros.\n\nJunqueira de Miranda Advocacia`); emailSent=true; } catch(error){emailError=error instanceof Error?error.message:"Falha no envio do e-mail.";} }
  return Response.json({ request: { id, clientName, clientEmail, expiresAt: Date.now() + hours * 3600000 }, link, emailSent, emailError }, { status: 201 });
}
