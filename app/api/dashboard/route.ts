import { db, isAdmin } from "../google/_lib";
import { ensureClientTables } from "../clients/_lib";
import { ensureRequestTables } from "../requests/_lib";

export async function GET(request:Request){
  if(!await isAdmin(request)) return Response.json({error:"Acesso não autorizado."},{status:403});
  await ensureClientTables();await ensureRequestTables();const database=await db();
  const clients=await database.prepare("SELECT COUNT(*) total FROM clients").first<{total:number}>();
  const documents=await database.prepare("SELECT COUNT(*) total FROM document_requests r WHERE r.status IN ('submitted','correction_needed') AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.request_id=r.id)").first<{total:number}>();
  const contracts=await database.prepare("SELECT COUNT(*) total FROM contracts c JOIN document_requests r ON r.id=c.request_id WHERE r.status!='approved'").first<{total:number}>();
  const recent=await database.prepare(`SELECT r.id,r.client_name,r.status,r.created_at,r.submitted_at,
    CASE WHEN c.id IS NULL THEN 'Documento' ELSE 'Contrato' END kind
    FROM document_requests r LEFT JOIN contracts c ON c.request_id=r.id ORDER BY COALESCE(r.submitted_at,r.created_at) DESC LIMIT 6`).all();
  return Response.json({stats:{clients:clients?.total||0,documents:documents?.total||0,contracts:contracts?.total||0},recent:recent.results});
}
