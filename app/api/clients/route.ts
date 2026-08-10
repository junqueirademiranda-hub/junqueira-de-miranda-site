import { db, isAdmin } from "../google/_lib";
import { ensureClientTables } from "./_lib";

export async function GET(request:Request){
  if(!await isAdmin(request)) return Response.json({error:"Acesso não autorizado."},{status:403});
  await ensureClientTables(); const rows=await (await db()).prepare("SELECT * FROM clients ORDER BY name COLLATE NOCASE").all();
  return Response.json({clients:rows.results});
}

export async function POST(request:Request){
  if(!await isAdmin(request)) return Response.json({error:"Acesso não autorizado."},{status:403});
  const body=await request.json() as {name?:string;email?:string;phone?:string;notes?:string};
  const name=String(body.name||"").trim(),email=String(body.email||"").trim().toLowerCase(),phone=String(body.phone||"").trim().slice(0,30),notes=String(body.notes||"").trim().slice(0,1000);
  if(name.length<3||!/^\S+@\S+\.\S+$/.test(email)) return Response.json({error:"Informe nome e e-mail válidos."},{status:400});
  await ensureClientTables(); const database=await db(); const existing=await database.prepare("SELECT id FROM clients WHERE email=?").bind(email).first<{id:string}>(); const now=new Date().toISOString();
  if(existing){await database.prepare("UPDATE clients SET name=?,phone=?,notes=?,updated_at=? WHERE id=?").bind(name,phone,notes,now,existing.id).run();return Response.json({ok:true,id:existing.id,updated:true});}
  const id=crypto.randomUUID();await database.prepare("INSERT INTO clients (id,name,email,phone,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(id,name,email,phone,notes,now,now).run();return Response.json({ok:true,id},{status:201});
}
