import { isAdmin, db } from "../../google/_lib";
import { ensureRequestTables } from "../_lib";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  await ensureRequestTables(); const { id } = await context.params; const database = await db();
  const item = await database.prepare("SELECT * FROM document_requests WHERE id=?").bind(id).first();
  if (!item) return Response.json({ error: "Solicitação não encontrada." }, { status: 404 });
  const documents = await database.prepare(`SELECT d.id,d.label,d.position,r.status review_status,r.notes review_notes
    FROM request_documents d LEFT JOIN document_reviews r ON r.request_document_id=d.id WHERE d.request_id=? ORDER BY d.position`).bind(id).all();
  const files = await database.prepare(`SELECT f.id,f.drive_file_id,f.file_name,f.mime_type,f.size,f.created_at,m.request_document_id
    FROM request_files f LEFT JOIN request_document_files m ON m.file_id=f.id WHERE f.request_id=? ORDER BY f.created_at`).bind(id).all();
  return Response.json({ request: item, documents: documents.results, files: files.results });
}
