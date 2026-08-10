import { db } from "../../google/_lib";
import { validRequest } from "../../requests/_lib";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const row = await validRequest(token);
  if (!row) return Response.json({ error: "Link inválido." }, { status: 404 });
  if (row.expires_at < Date.now()) return Response.json({ error: "Este link expirou. Solicite outro ao escritório." }, { status: 410 });
  const database = await db();
  const files = await database.prepare(`SELECT f.id,f.file_name,f.mime_type,f.size,f.created_at,m.request_document_id
    FROM request_files f LEFT JOIN request_document_files m ON m.file_id=f.id WHERE f.request_id=? ORDER BY f.created_at`).bind(row.id).all();
  const documents = await database.prepare(`SELECT d.id,d.label,d.position,COUNT(m.file_id) file_count FROM request_documents d
    LEFT JOIN request_document_files m ON m.request_document_id=d.id WHERE d.request_id=? GROUP BY d.id ORDER BY d.position`).bind(row.id).all();
  const contract = await database.prepare("SELECT file_name,size FROM contracts WHERE request_id=?").bind(row.id).first();
  return Response.json({ request: { clientName: row.client_name, instructions: row.instructions, status: row.status, expiresAt: row.expires_at }, documents: documents.results, files: files.results, contract });
}
