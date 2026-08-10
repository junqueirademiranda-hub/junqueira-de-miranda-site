import { db, getAccessToken, getDriveConfig } from "../../../google/_lib";
import { validRequest } from "../../../requests/_lib";

export async function GET(request:Request,context:{params:Promise<{token:string}>}){
  const {token}=await context.params; const row=await validRequest(token);
  if(!row) return Response.json({error:"Link inválido."},{status:404});
  if(row.expires_at<Date.now()) return Response.json({error:"Este link expirou."},{status:410});
  const contract=await (await db()).prepare("SELECT drive_file_id,file_name,mime_type FROM contracts WHERE request_id=?").bind(row.id).first<{drive_file_id:string;file_name:string;mime_type:string}>();
  if(!contract) return Response.json({error:"Contrato não encontrado."},{status:404});
  const config=await getDriveConfig(), access=await getAccessToken(config); const response=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(contract.drive_file_id)}?alt=media`,{headers:{authorization:`Bearer ${access}`}});
  if(!response.ok) return Response.json({error:"Não foi possível abrir o contrato."},{status:502});
  const download=new URL(request.url).searchParams.get("download")==="1";
  return new Response(response.body,{headers:{"content-type":contract.mime_type||"application/pdf","content-disposition":`${download?"attachment":"inline"}; filename*=UTF-8''${encodeURIComponent(contract.file_name)}`,"cache-control":"private, no-store"}});
}
