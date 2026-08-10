"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

type FileRow = { id: string; file_name: string; size: number; request_document_id?: string | null };
type RequestedDocument = { id: string; label: string; position: number; file_count: number };
type AccessData = { request: { clientName: string; instructions: string; status: "open" | "submitted"; expiresAt: number }; documents: RequestedDocument[]; files: FileRow[]; contract?: {file_name:string;size:number}|null };

export default function TemporaryAccess({ token }: { token: string }) {
  const [data, setData] = useState<AccessData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const response = await fetch(`/api/access/${token}`, { cache: "no-store" });
    const result = await response.json() as AccessData & { error?: string };
    if (!response.ok) return setError(result.error || "Não foi possível abrir esta solicitação.");
    setData(result); setError("");
  }
  useEffect(() => { load(); }, [token]);
  async function upload(event: ChangeEvent<HTMLInputElement>, documentId: string) {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true); setError(""); const form = new FormData(); form.set("file", file); form.set("documentId", documentId);
    const response = await fetch(`/api/access/${token}/upload`, { method: "POST", body: form });
    const result = await response.json() as { error?: string };
    setBusy(false); event.target.value = "";
    if (!response.ok) return setError(result.error || "Não foi possível enviar o arquivo.");
    await load();
  }
  async function complete() {
    if (!confirm("Confirma que terminou de enviar os documentos? Depois disso, este link será encerrado.")) return;
    setBusy(true); const response = await fetch(`/api/access/${token}/complete`, { method: "POST" });
    const result = await response.json() as { error?: string }; setBusy(false);
    if (!response.ok) return setError(result.error || "Não foi possível concluir o envio.");
    await load();
  }
  const instructionLines = data?.request.instructions.split("\n") || [];
  const requestedDocuments = instructionLines.filter(line => line.startsWith("• ")).map(line => line.slice(2));
  const observations = instructionLines.find(line => line.startsWith("Observações:"))?.replace("Observações:", "").trim();
  return <main className="access-page"><header className="access-brand"><Image src="/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" width={240} height={138} priority unoptimized /></header><section className="access-card">
    <p className="access-eyebrow">ENVIO SEGURO DE DOCUMENTOS</p>
    {error && !data ? <div className="access-message error"><h1>Não foi possível acessar</h1><p>{error}</p><small>Entre em contato com o escritório para solicitar um novo link.</small></div> : !data ? <div className="access-message"><h1>Abrindo sua solicitação...</h1></div> : data.request.status === "submitted" ? <div className="access-message success"><h1>Envio concluído</h1><p>Os documentos foram recebidos pelo escritório.</p><small>Este link foi encerrado e não aceita novos arquivos.</small></div> : <>
      <h1>Olá, {data.request.clientName}.</h1><p className="access-intro">{data.contract ? "Confira o contrato e devolva abaixo a versão assinada." : "Envie abaixo os documentos solicitados pelo escritório."}</p>
      {data.contract&&<div className="access-instructions"><strong>Contrato enviado pelo escritório</strong><p>{data.contract.file_name}</p><div className="document-upload-actions"><a target="_blank" rel="noreferrer" href={`/api/access/${token}/contract`}>Visualizar contrato</a><a href={`/api/access/${token}/contract?download=1`}>Baixar contrato</a></div></div>}
      <div className="access-instructions"><strong>Documentos solicitados</strong><p>Envie cada item no botão correspondente.</p>{observations && <div className="client-observation"><b>Observação do escritório</b><p>{observations}</p></div>}</div>
      {error && <div className="access-alert">{error}</div>}
      <div className="document-upload-cards">{data.documents?.length ? data.documents.map(document => { const files = data.files.filter(file => file.request_document_id === document.id); return <section key={document.id} className={files.length ? "uploaded" : "pending"}><div className="document-upload-title"><span>{files.length ? "✓" : document.position + 1}</span><div><h2>{document.label}</h2><small>{files.length ? `${files.length} arquivo(s) enviado(s)` : "Aguardando envio"}</small></div></div>{files.map(file => <div className="document-file" key={file.id}><strong>{file.file_name}</strong><small>{Math.max(1, Math.ceil(file.size / 1024))} KB</small></div>)}<div className="document-upload-actions"><label>{busy ? "Aguarde..." : "Escolher arquivo"}<input type="file" accept="application/pdf,image/jpeg,image/png" onChange={event => upload(event, document.id)} disabled={busy} /></label><label className="camera-button">Tirar foto<input type="file" accept="image/*" capture="environment" onChange={event => upload(event, document.id)} disabled={busy} /></label></div></section>; }) : <p>Esta solicitação antiga não possui itens separados. Peça um novo link ao escritório.</p>}</div>
      <p className="access-help">PDF, JPG ou PNG, até 10 MB. Para frente e verso, envie uma imagem e depois use novamente o mesmo botão.</p>
      <button className="access-complete" onClick={complete} disabled={busy || !data.documents?.length || data.documents.some(document => !Number(document.file_count))}>Concluir envio</button>
      <p className="access-expiry">Link válido até {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(data.request.expiresAt))}.</p>
    </>}
  </section><footer>Junqueira de Miranda Advocacia · Ambiente de teste</footer></main>;
}
