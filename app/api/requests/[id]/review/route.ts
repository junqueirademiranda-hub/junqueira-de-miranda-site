import { isAdmin, db } from "../../../google/_lib";
import { ensureRequestTables } from "../../_lib";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  await ensureRequestTables(); const { id } = await context.params;
  const body = await request.json() as { documentId?: string; status?: string; notes?: string };
  const status = body.status === "approved" ? "approved" : body.status === "correction" ? "correction" : "";
  const notes = String(body.notes || "").trim().slice(0, 1000);
  if (!body.documentId || !status || (status === "correction" && notes.length < 3)) return Response.json({ error: "Informe a decisão e, para correção, escreva a orientação." }, { status: 400 });
  const database = await db(); const document = await database.prepare("SELECT id FROM request_documents WHERE id=? AND request_id=?").bind(body.documentId,id).first();
  if (!document) return Response.json({ error: "Documento não encontrado." }, { status: 404 });
  await database.prepare(`INSERT INTO document_reviews (request_document_id,status,notes,reviewed_at) VALUES (?,?,?,?)
    ON CONFLICT(request_document_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,reviewed_at=excluded.reviewed_at`).bind(body.documentId,status,notes,new Date().toISOString()).run();
  const pending = await database.prepare(`SELECT COUNT(*) total FROM request_documents d LEFT JOIN document_reviews r ON r.request_document_id=d.id
    WHERE d.request_id=? AND r.status IS NULL`).bind(id).first<{total:number}>();
  if (!pending?.total) {
    const corrections = await database.prepare(`SELECT COUNT(*) total FROM request_documents d JOIN document_reviews r ON r.request_document_id=d.id
      WHERE d.request_id=? AND r.status='correction'`).bind(id).first<{total:number}>();
    await database.prepare("UPDATE document_requests SET status=? WHERE id=?").bind(corrections?.total ? "correction_needed" : "approved",id).run();
  }
  return Response.json({ ok: true });
}
