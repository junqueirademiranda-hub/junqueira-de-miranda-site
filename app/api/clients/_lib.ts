import { db } from "../google/_lib";

export async function ensureClientTables(){
  const database=await db();
  await database.prepare(`CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
}

export async function upsertClient(name:string,email:string){
  await ensureClientTables(); const database=await db(); const now=new Date().toISOString();
  const existing=await database.prepare("SELECT id FROM clients WHERE email=?").bind(email).first<{id:string}>();
  if(existing){await database.prepare("UPDATE clients SET name=?,updated_at=? WHERE id=?").bind(name,now,existing.id).run();return existing.id;}
  const id=crypto.randomUUID(); await database.prepare("INSERT INTO clients (id,name,email,created_at,updated_at) VALUES (?,?,?,?,?)").bind(id,name,email,now,now).run(); return id;
}
