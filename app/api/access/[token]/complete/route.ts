import { connectedGoogleEmail, db, sendPortalEmail } from "../../../google/_lib";
import { validRequest } from "../../../requests/_lib";

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const row = await validRequest(token);
  if (!row) return Response.json({ error: "Link inválido." }, { status: 404 });
  if (row.status !== "open" || row.expires_at < Date.now()) return Response.json({ error: "Solicitação encerrada ou expirada." }, { status: 410 });
  const database = await db();
  const missing = await database.prepare(`SELECT d.label FROM request_documents d LEFT JOIN request_document_files m ON m.request_document_id=d.id
    WHERE d.request_id=? GROUP BY d.id HAVING COUNT(m.file_id)=0 ORDER BY d.position`).bind(row.id).all<{label:string}>();
  if (missing.results.length) return Response.json({ error: `Ainda falta enviar: ${missing.results.map(item=>item.label).join(", ")}.` }, { status: 400 });
  const count = await database.prepare("SELECT COUNT(*) total FROM request_files WHERE request_id=?").bind(row.id).first<{total:number}>();
  if (!count?.total) return Response.json({ error: "Envie pelo menos um arquivo antes de concluir." }, { status: 400 });
  await database.prepare("UPDATE document_requests SET status='submitted',submitted_at=? WHERE id=?").bind(new Date().toISOString(),row.id).run();
  let notificationSent=false;
  try {
    const connectedRecipient=await connectedGoogleEmail();
    const recipients=Array.from(new Set([connectedRecipient.toLowerCase(),"simonejmiranda.adv@gmail.com"]));
    const message=`Uma solicitação de documentos foi concluída por ${row.client_name}.\n\nAcesse o painel administrativo para conferir os arquivos.\n\nNenhum detalhe do atendimento foi incluído neste e-mail.`;
    const results=await Promise.allSettled(recipients.map(recipient=>sendPortalEmail(recipient,"Portal - documentos recebidos",message)));
    notificationSent=results.some(result=>result.status==="fulfilled");
  } catch {}
  return Response.json({ ok: true, notificationSent });
}
