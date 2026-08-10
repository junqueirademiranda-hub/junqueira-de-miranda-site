"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type View = "admin" | "cliente";
type AdminTab = "inicio" | "clientes" | "documentos" | "contratos";
type ClientTab = "inicio" | "documentos" | "procuracao" | "contrato" | "processo";

const adminLabels: Record<AdminTab, string> = {
  inicio: "Visão geral",
  clientes: "Clientes",
  documentos: "Documentos",
  contratos: "Contratos",
};

const clientLabels: Record<ClientTab, string> = {
  inicio: "Início",
  documentos: "Meus documentos",
  procuracao: "Procuração",
  contrato: "Contrato",
  processo: "Acompanhamento",
};

const clients = [
  { initials: "MS", name: "Mariana Silva", matter: "Pensão alimentícia", status: "Documentos em análise", pending: 1, contract: "Fechado" },
  { initials: "CR", name: "Carlos Rodrigues", matter: "Defesa criminal", status: "Documentos pendentes", pending: 2, contract: "Fechado" },
  { initials: "AF", name: "Ana Ferreira", matter: "Divórcio consensual", status: "Contrato enviado", pending: 0, contract: "Em assinatura" },
  { initials: "JL", name: "João Lima", matter: "Regularização de imóvel", status: "Em orçamento", pending: 0, contract: "Orçamento" },
];

function Mark() {
  return (
    <div className="brand" aria-label="Junqueira de Miranda Advocacia">
      <Image src="/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" width={230} height={132} priority unoptimized />
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

function Badge({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "green" | "blue" | "muted" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [view, setView] = useState<View>("admin");
  const [adminTab, setAdminTab] = useState<AdminTab>("inicio");
  const [clientTab, setClientTab] = useState<ClientTab>("inicio");
  const [notice, setNotice] = useState("");
  const [generated, setGenerated] = useState(false);
  const [selectedClient, setSelectedClient] = useState(clients[0]);

  const activeLabel = useMemo(() => view === "admin" ? adminLabels[adminTab] : clientLabels[clientTab], [view, adminTab, clientTab]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <main className="app-shell">
      {notice && <div className="toast" role="status">{notice}</div>}
      <aside className="sidebar">
        <Mark />
        <div className="mode-label">AMBIENTE DE TESTES</div>
        <nav aria-label="Navegação principal">
          {view === "admin" ? (Object.keys(adminLabels) as AdminTab[]).map((tab, i) => (
            <button key={tab} className={adminTab === tab ? "active" : ""} onClick={() => setAdminTab(tab)}>
              <Icon>{["⌂", "C", "D", "T"][i]}</Icon>{adminLabels[tab]}
            </button>
          )) : (Object.keys(clientLabels) as ClientTab[]).map((tab, i) => (
            <button key={tab} className={clientTab === tab ? "active" : ""} onClick={() => setClientTab(tab)}>
              <Icon>{["⌂", "D", "P", "C", "A"][i]}</Icon>{clientLabels[tab]}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span>Visualizando como</span>
          <div className="profile admin-identity">
            <span className="avatar">SM</span>
            <span><strong>Simone Miranda</strong><small>Administradora</small></span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><span className="eyebrow">PORTAL SEGURO</span><h1>{activeLabel}</h1></div>
          <div className="top-actions">
            <a className="ghost logout-link" href="/api/admin/logout">Sair</a>
            <button className="round" aria-label="Notificações">3</button>
          </div>
        </header>

        {view === "admin" ? (
          <AdminView tab={adminTab} setTab={setAdminTab} flash={flash} selected={selectedClient} setSelected={setSelectedClient} />
        ) : (
          <ClientView tab={clientTab} setTab={setClientTab} flash={flash} generated={generated} setGenerated={setGenerated} />
        )}
      </section>
    </main>
  );
}

function AdminView({ tab, setTab, flash, selected, setSelected }: { tab: AdminTab; setTab: (t: AdminTab) => void; flash: (s: string) => void; selected: typeof clients[0]; setSelected: (c: typeof clients[0]) => void }) {
  if (tab === "clientes") return <ClientsAdmin flash={flash}/>;

  if (tab === "documentos") return <DocumentsAdmin flash={flash} />;
  if (tab === "contratos") return <ContractsAdmin flash={flash} />;
  return <DashboardAdmin setTab={setTab} flash={flash}/>;
}

type RealClient={id:string;name:string;email:string;phone?:string;notes?:string};

function ClientFields(){
  const [list,setList]=useState<RealClient[]>([]);const [selected,setSelected]=useState("");const [name,setName]=useState("");const [email,setEmail]=useState("");
  useEffect(()=>{fetch("/api/clients",{cache:"no-store"}).then(r=>r.ok?r.json():{clients:[]}).then(r=>setList(r.clients||[]));},[]);
  function choose(id:string){setSelected(id);const item=list.find(c=>c.id===id);if(item){setName(item.name);setEmail(item.email);}}
  return <><label>Cliente cadastrado<select value={selected} onChange={e=>choose(e.target.value)}><option value="">Selecionar ou preencher abaixo</option>{list.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Nome do cliente<input name="clientName" required minLength={3} value={name} onChange={e=>{setName(e.target.value);setSelected("");}} placeholder="Nome completo"/></label><label>E-mail do cliente<input name="clientEmail" type="email" required value={email} onChange={e=>{setEmail(e.target.value);setSelected("");}} placeholder="cliente@email.com"/></label></>;
}

function ClientsAdmin({flash}:{flash:(s:string)=>void}){
  const [list,setList]=useState<RealClient[]>([]);const [saving,setSaving]=useState(false);
  async function load(){const response=await fetch("/api/clients",{cache:"no-store"});const result=await response.json() as {clients?:RealClient[];error?:string};if(!response.ok)return flash(result.error||"Não foi possível consultar os clientes.");setList(result.clients||[]);}
  useEffect(()=>{load();},[]);
  async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);const form=new FormData(event.currentTarget);const response=await fetch("/api/clients",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:form.get("name"),email:form.get("email"),phone:form.get("phone"),notes:form.get("notes")})});const result=await response.json() as {error?:string};setSaving(false);if(!response.ok)return flash(result.error||"Não foi possível salvar o cliente.");event.currentTarget.reset();flash("Cliente salvo.");await load();}
  return <div className="content enter"><div className="section-head"><div><p>GESTÃO DE ATENDIMENTOS</p><h2>Clientes cadastrados</h2></div></div><div className="two-col"><form className="panel form-panel" onSubmit={save}><div className="panel-title"><div><p>NOVO CADASTRO</p><h3>Dados do cliente</h3></div></div><label>Nome completo<input name="name" required minLength={3}/></label><label>E-mail<input name="email" type="email" required/></label><label>Telefone ou WhatsApp<input name="phone" inputMode="tel"/></label><label>Observações internas<textarea name="notes" placeholder="Informação visível somente para Simone."/></label><button className="primary full" disabled={saving}>{saving?"Salvando...":"Salvar cliente"}</button></form><section className="panel request-history"><div className="panel-title"><div><p>CADASTROS REAIS</p><h3>{list.length} cliente(s)</h3></div><button onClick={load}>Atualizar</button></div>{list.length?list.map(c=><article key={c.id}><div><strong>{c.name}</strong><small>{c.email}</small><small>{c.phone||"Telefone não informado"}</small></div></article>):<div className="empty-drive">Nenhum cliente cadastrado ainda.</div>}</section></div></div>;
}

function DashboardAdmin({setTab,flash}:{setTab:(t:AdminTab)=>void;flash:(s:string)=>void}){
  type Data={stats:{clients:number;documents:number;contracts:number};recent:Array<{id:string;client_name:string;status:string;kind:string;created_at:string;submitted_at?:string}>};const [data,setData]=useState<Data|null>(null);
  useEffect(()=>{fetch("/api/dashboard",{cache:"no-store"}).then(async r=>{const value=await r.json();if(!r.ok)throw new Error(value.error);setData(value);}).catch(e=>flash(e.message||"Não foi possível atualizar o painel."));},[]);
  return <div className="content enter"><div className="welcome"><div><p>PAINEL ADMINISTRATIVO</p><h2>Bom dia, Simone.</h2><span>Informações reais do atendimento.</span></div><button className="primary" onClick={()=>setTab("clientes")}>+ Cadastrar cliente</button></div><div className="stats"><article><span className="stat-icon">C</span><div><strong>{data?.stats.clients??"—"}</strong><small>Clientes cadastrados</small></div></article><article><span className="stat-icon">D</span><div><strong>{data?.stats.documents??"—"}</strong><small>Documentos para conferir</small></div></article><article><span className="stat-icon">T</span><div><strong>{data?.stats.contracts??"—"}</strong><small>Contratos em andamento</small></div></article></div><section className="panel"><div className="panel-title"><div><p>ATIVIDADE</p><h3>Solicitações recentes</h3></div><button onClick={()=>setTab("documentos")}>Abrir documentos →</button></div>{data?.recent.length?data.recent.map(item=><div className="task" key={item.id}><span className="avatar">{item.client_name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><div><strong>{item.client_name}</strong><small>{item.status==="submitted"?"Envio concluído pelo cliente":item.status==="approved"?"Conferência aprovada":"Aguardando conclusão"}</small></div><Badge tone={item.kind==="Contrato"?"blue":"gold"}>{item.kind}</Badge></div>):<div className="empty-drive">Ainda não há solicitações registradas.</div>}</section></div>;
}

function ClientDetail({ client, flash }: { client: typeof clients[0]; flash: (s: string) => void }) {
  return <section className="panel detail-panel"><div className="panel-title"><div><p>ATENDIMENTO SELECIONADO</p><h3>{client.name}</h3></div><Badge tone="blue">{client.status}</Badge></div>
    <div className="detail-columns"><div><span>Assunto</span><strong>{client.matter}</strong></div><div><span>Situação comercial</span><strong>Contrato {client.contract.toLowerCase()}</strong></div><div><span>Última atividade</span><strong>Hoje, 09:42</strong></div></div>
    <div className="button-row"><button className="primary" onClick={() => flash("Convite de teste preparado. O envio real por e-mail ainda está desativado.")}>Enviar convite por e-mail</button><button className="secondary" onClick={() => flash("Área do cliente aberta no modo de demonstração.")}>Visualizar como cliente</button></div>
    {client.contract === "Fechado" ? <DeadlineSection clientName={client.name} flash={flash} /> : <div className="locked-deadlines"><strong>Prazos ainda não disponíveis</strong><span>O cadastro de prazos e audiências será liberado somente depois que o contrato estiver fechado.</span></div>}
  </section>;
}

function DeadlineSection({ clientName, flash }: { clientName: string; flash: (s: string) => void }) {
  return <div className="deadline-section">
    <div className="deadline-heading"><div><p>PRAZOS INTERNOS</p><h4>Prazos e audiências</h4><span>Os avisos serão enviados somente para Simone.</span></div><Badge tone="green">CONTRATO FECHADO</Badge></div>
    <div className="deadline-layout">
      <div className="deadline-list">
        <article><div className="date-box"><b>14</b><span>AGO</span></div><div><strong>Audiência de conciliação</strong><small>14/08/2026 às 14:30</small><em>Lembrete para Simone em 5 dias</em></div><Badge tone="gold">PRÓXIMO</Badge></article>
        <article><div className="date-box"><b>20</b><span>AGO</span></div><div><strong>Prazo para impugnação</strong><small>Vencimento confirmado: 20/08/2026</small><em>Avisos: 10, 5, 2 e 1 dia antes</em></div><Badge tone="blue">PENDENTE</Badge></article>
      </div>
      <div className="deadline-form">
        <label>Tipo<select defaultValue="Prazo processual"><option>Prazo processual</option><option>Audiência</option><option>Reunião</option><option>Providência interna</option></select></label>
        <label>Descrição<input defaultValue="Prazo para manifestação" /></label>
        <div><label>Data final<input type="date" defaultValue="2026-08-25" /></label><label>Horário<input type="time" defaultValue="18:00" /></label></div>
        <label>Observação<input placeholder="Informação interna do escritório" /></label>
        <button className="primary full" onClick={() => flash(`Prazo de ${clientName} salvo. Os e-mails reais ainda estão desativados.`)}>Cadastrar prazo</button>
      </div>
    </div>
  </div>;
}

function DocumentsAdmin({ flash }: { flash: (s: string) => void }) {
  return <div className="content enter"><div className="section-head"><div><p>CENTRAL DE ARQUIVOS</p><h2>Solicitações e documentos recebidos</h2></div></div><TemporaryRequestAdmin flash={flash} /><GoogleDriveSetup flash={flash} /><DriveDocumentsAdmin flash={flash} /><p className="integration-note">Ambiente de teste: utilize apenas nomes e documentos fictícios. Cada link é individual, tem validade e deixa de aceitar arquivos depois que o cliente conclui o envio.</p></div>;
}

type DocumentRequest = { id: string; client_name: string; client_email: string; instructions: string; status: "open" | "submitted" | "approved" | "correction_needed"; expires_at: number; created_at: string; submitted_at?: string | null; file_count: number };

const documentOptions = [
  "RG ou CNH",
  "CPF",
  "Comprovante de endereço",
  "Certidão de nascimento",
  "Certidão de casamento",
  "Comprovantes de renda",
  "Extratos bancários",
  "Carteira de trabalho",
  "Declaração de imposto de renda",
  "Contrato",
  "Boletim de ocorrência",
  "Intimação ou citação",
  "Decisão judicial",
  "Prints de conversas",
  "Fotografias",
  "Documentos dos filhos",
  "Procuração assinada",
];

function TemporaryRequestAdmin({ flash }: { flash: (s: string) => void }) {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    const response = await fetch("/api/requests", { cache: "no-store" });
    const result = await response.json() as { requests?: DocumentRequest[]; error?: string };
    setLoading(false);
    if (!response.ok) return flash(result.error || "Não foi possível consultar as solicitações.");
    setRequests(result.requests || []);
  }
  useEffect(() => { load(); }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setLink("");
    const form = new FormData(event.currentTarget);
    const selected = form.getAll("documents").map(String);
    const other = String(form.get("otherDocument") || "").trim();
    const observations = String(form.get("observations") || "").trim();
    if (other) selected.push(other);
    if (!selected.length) { setSaving(false); return flash("Selecione pelo menos um documento."); }
    const sendEmail = form.get("sendEmail") === "on";
    const response = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientName: form.get("clientName"), clientEmail: form.get("clientEmail"), documents: selected, observations, hours: Number(form.get("hours")), sendEmail }) });
    const result = await response.json() as { link?: string; error?: string; emailSent?: boolean; emailError?: string };
    setSaving(false);
    if (!response.ok || !result.link) return flash(result.error || "Não foi possível criar o link.");
    setLink(result.link); setEmailNotice(result.emailSent ? "E-mail enviado automaticamente ao cliente." : `Link criado, mas o e-mail não foi enviado: ${result.emailError || "reautorize o Gmail."}`); event.currentTarget.reset(); await load();
    flash(result.emailSent ? "Link criado e enviado ao cliente por e-mail." : "Link criado. O Gmail ainda precisa ser ativado para o envio automático.");
  }
  async function copy() {
    await navigator.clipboard.writeText(link);
    flash("Link copiado.");
  }
  const statusLabel = (item: DocumentRequest) => item.status === "approved" ? "APROVADO" : item.status === "correction_needed" ? "CORREÇÃO NECESSÁRIA" : item.status === "submitted" ? "AGUARDANDO CONFERÊNCIA" : item.expires_at < Date.now() ? "EXPIRADO" : "AGUARDANDO CLIENTE";
  return <section className="temporary-requests">
    <div className="request-layout">
      <form className="panel request-form" onSubmit={create}>
        <div className="panel-title"><div><p>NOVO LINK TEMPORÁRIO</p><h3>Solicitar documentos</h3></div><Badge tone="blue">SEM LOGIN DO CLIENTE</Badge></div>
        <ClientFields />
        <fieldset className="document-checklist"><legend>Marque os documentos necessários</legend><div>{documentOptions.map(item => <label key={item}><input type="checkbox" name="documents" value={item} /><span>{item}</span></label>)}</div></fieldset>
        <label>Outro documento<input name="otherDocument" placeholder="Digite somente se não estiver na lista" /></label>
        <label>Observações para o cliente<textarea name="observations" placeholder="Ex.: enviar frente e verso; comprovante emitido nos últimos 90 dias." /></label>
        <label>Validade do link<select name="hours" defaultValue="72"><option value="24">24 horas</option><option value="48">48 horas</option><option value="72">3 dias</option><option value="168">7 dias</option></select></label>
        <label className="send-email-choice"><input type="checkbox" name="sendEmail" defaultChecked /><span><strong>Enviar este link por e-mail ao cliente</strong><small>O link também ficará disponível para copiar.</small></span></label>
        <button className="primary full" disabled={saving}>{saving ? "Criando link..." : "Gerar link e concluir solicitação"}</button>
        {link && <div className="generated-link"><strong>Link criado</strong><input readOnly value={link} aria-label="Link temporário criado" /><button type="button" className="secondary" onClick={copy}>Copiar link</button><small>{emailNotice}</small></div>}
      </form>
      <div className="panel request-history">
        <div className="panel-title"><div><p>ACOMPANHAMENTO</p><h3>Links recentes</h3></div><button onClick={load}>{loading ? "Atualizando..." : "Atualizar"}</button></div>
        {loading ? <div className="empty-drive">Consultando solicitações...</div> : requests.length ? requests.map(item => <article key={item.id}><div><strong>{item.client_name}</strong><small>{item.client_email}</small><small>{item.file_count} arquivo(s) recebido(s)</small></div><div className="request-row-actions"><Badge tone={item.status === "approved" ? "green" : item.status === "submitted" || item.status === "correction_needed" ? "blue" : item.expires_at < Date.now() ? "muted" : "gold"}>{statusLabel(item)}</Badge>{item.status !== "open" && <button className="secondary" onClick={() => setSelectedRequest(item.id)}>Conferir</button>}</div></article>) : <div className="empty-drive">Nenhum link criado ainda.</div>}
      </div>
    </div>
    {selectedRequest && <RequestReview requestId={selectedRequest} flash={flash} onClose={() => { setSelectedRequest(null); load(); }} />}
  </section>;
}

type ReviewDocument = { id:string; label:string; position:number; review_status?:"approved"|"correction"|null; review_notes?:string|null };
type ReviewFile = { id:string; drive_file_id:string; file_name:string; mime_type:string; size:number; request_document_id:string };

function RequestReview({ requestId, flash, onClose }: { requestId:string; flash:(s:string)=>void; onClose:()=>void }) {
  const [details,setDetails]=useState<{request:{client_name:string;client_email:string;status:string};documents:ReviewDocument[];files:ReviewFile[]}|null>(null);
  const [correctionLink,setCorrectionLink]=useState("");
  const [correctionEmailNotice,setCorrectionEmailNotice]=useState("");
  async function load(){const response=await fetch(`/api/requests/${requestId}`,{cache:"no-store"});const result=await response.json();if(!response.ok)return flash(result.error||"Não foi possível abrir a solicitação.");setDetails(result);}
  useEffect(()=>{load();},[requestId]);
  async function createCorrection(){const response=await fetch(`/api/requests/${requestId}/correction`,{method:"POST"});const result=await response.json() as {link?:string;error?:string;emailSent?:boolean;emailError?:string};if(!response.ok||!result.link)return flash(result.error||"Não foi possível gerar o link.");setCorrectionLink(result.link);setCorrectionEmailNotice(result.emailSent?"E-mail enviado automaticamente ao cliente.":`O e-mail não foi enviado: ${result.emailError||"reautorize o Gmail."}`);flash(result.emailSent?"Novo link criado e enviado ao cliente por e-mail.":`Link criado, mas o e-mail falhou: ${result.emailError||"reautorize o Gmail."}`);}
  async function copy(){await navigator.clipboard.writeText(correctionLink);flash("Link de correção copiado.");}
  if(!details)return <section className="panel review-panel"><div className="empty-drive">Abrindo documentos...</div></section>;
  const hasCorrection=details.documents.some(document=>document.review_status==="correction");
  return <section className="panel review-panel"><div className="panel-title"><div><p>CONFERÊNCIA</p><h3>{details.request.client_name}</h3><span>{details.request.client_email}</span></div><button onClick={onClose}>Fechar ×</button></div>
    <div className="review-documents">{details.documents.map(document=><ReviewDocumentCard key={document.id} requestId={requestId} document={document} files={details.files.filter(file=>file.request_document_id===document.id)} flash={flash} reload={load}/>)}</div>
    {hasCorrection&&<div className="correction-link-box"><button className="primary" onClick={createCorrection}>Gerar e enviar correção por e-mail</button>{correctionLink&&<div><input readOnly value={correctionLink}/><button className="secondary" onClick={copy}>Copiar link</button><small>{correctionEmailNotice}</small></div>}</div>}
  </section>;
}

function ReviewDocumentCard({requestId,document,files,flash,reload}:{requestId:string;document:ReviewDocument;files:ReviewFile[];flash:(s:string)=>void;reload:()=>Promise<void>}){
  const [notes,setNotes]=useState(document.review_notes||""); const [saving,setSaving]=useState(false);
  async function decide(status:"approved"|"correction"){setSaving(true);const response=await fetch(`/api/requests/${requestId}/review`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({documentId:document.id,status,notes})});const result=await response.json() as {error?:string};setSaving(false);if(!response.ok)return flash(result.error||"Não foi possível salvar a conferência.");flash(status==="approved"?`${document.label} aprovado.`:`Correção solicitada para ${document.label}.`);await reload();}
  return <article className={`review-document ${document.review_status||"pending"}`}><div className="review-document-head"><div><h4>{document.label}</h4><span>{files.length} arquivo(s)</span></div><Badge tone={document.review_status==="approved"?"green":document.review_status==="correction"?"gold":"muted"}>{document.review_status==="approved"?"APROVADO":document.review_status==="correction"?"CORRIGIR":"NÃO CONFERIDO"}</Badge></div>
    <div className="review-files">{files.map(file=><div key={file.id}><strong>{file.file_name}</strong><span><a className="view-file" target="_blank" rel="noreferrer" href={`/api/google/view?id=${encodeURIComponent(file.drive_file_id)}&name=${encodeURIComponent(file.file_name)}`}>Visualizar</a><a href={`/api/google/download?id=${encodeURIComponent(file.drive_file_id)}&name=${encodeURIComponent(file.file_name)}`}>Baixar</a></span></div>)}</div>
    <label>Orientação, se precisar corrigir<textarea value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Explique claramente o que deve ser reenviado."/></label><div className="review-actions"><button className="secondary" disabled={saving} onClick={()=>decide("correction")}>Pedir correção</button><button className="primary" disabled={saving} onClick={()=>decide("approved")}>Aprovar documento</button></div>
  </article>;
}

type AdminDriveFile = { id: string; name: string; mimeType: string; size?: string; createdTime?: string; clientName: string };

function DriveDocumentsAdmin({ flash }: { flash: (s: string) => void }) {
  const [files, setFiles] = useState<AdminDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState("Todos os clientes");
  async function load() {
    setLoading(true);
    const response = await fetch("/api/google/files", { cache: "no-store" });
    const result = await response.json() as { files?: AdminDriveFile[]; error?: string };
    setLoading(false);
    if (!response.ok) return flash(result.error || "Não foi possível consultar o Google Drive.");
    setFiles(result.files || []);
  }
  useEffect(() => { load(); }, []);
  const clientNames = Array.from(new Set(files.map(file => file.clientName))).sort();
  const visible = client === "Todos os clientes" ? files : files.filter(file => file.clientName === client);
  function formatSize(value?: string) { const bytes = Number(value || 0); return bytes ? bytes < 1048576 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB` : "—"; }
  function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—"; }
  return <section className="drive-files">
    <div className="drive-toolbar"><label>Exibir documentos de<select value={client} onChange={event => setClient(event.target.value)}><option>Todos os clientes</option>{clientNames.map(name => <option key={name}>{name}</option>)}</select></label><div><button className="secondary" onClick={load} disabled={loading}>{loading ? "Atualizando..." : "Atualizar lista"}</button>{client !== "Todos os clientes" && <a className="primary zip-link" href={`/api/google/zip?client=${encodeURIComponent(client)}`}>Baixar documentos em ZIP</a>}</div></div>
    <div className="table panel"><div className="tr drive-th"><span>Cliente</span><span>Documento</span><span>Tamanho</span><span>Recebido</span><span></span></div>
      {loading ? <div className="empty-drive">Consultando o Google Drive...</div> : visible.length ? visible.map(file => <div className="tr" key={file.id}><span><b>{file.clientName}</b></span><span>{file.name}</span><span>{formatSize(file.size)}</span><span>{formatDate(file.createdTime)}</span><span><a className="file-download" href={`/api/google/download?id=${encodeURIComponent(file.id)}&name=${encodeURIComponent(file.name)}`}>Baixar</a></span></div>) : <div className="empty-drive">Nenhum documento recebido para este filtro.</div>}
    </div>
    {client === "Todos os clientes" && files.length > 0 && <p className="zip-guidance">Selecione uma cliente para liberar o download de todos os documentos dela em um único ZIP.</p>}
  </section>;
}

function GoogleDriveSetup({ flash }: { flash: (s: string) => void }) {
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean; emailEnabled?: boolean; email?: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/google/status").then(r => r.ok ? r.json() : null).then(setStatus).catch(() => setStatus(null)); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/google/config", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: form.get("clientId"), clientSecret: form.get("clientSecret") }) });
    const result = await response.json() as { error?: string };
    setSaving(false);
    if (!response.ok) return flash(result.error || "Não foi possível salvar a configuração.");
    setStatus({ configured: true, connected: false });
    flash("Credencial protegida. Agora autorize o Google Drive.");
    event.currentTarget.reset();
  }
  if (status?.connected) return <section className="panel drive-setup connected"><div><p>GOOGLE DRIVE E E-MAIL</p><h3>{status.emailEnabled ? "Drive e envio de e-mails ativos" : "Google Drive conectado"}</h3><span>Conta autorizada: {status.email}</span>{!status.emailEnabled && <a className="secondary gmail-enable" href="/api/google/connect">Autorizar envio de e-mails</a>}</div><div className="google-status-badges"><Badge tone="green">DRIVE CONECTADO</Badge><Badge tone={status.emailEnabled ? "green" : "gold"}>{status.emailEnabled ? "E-MAIL ATIVO" : "E-MAIL PENDENTE"}</Badge></div></section>;
  return <section className="panel drive-setup"><div className="panel-title"><div><p>GOOGLE DRIVE</p><h3>{status?.configured ? "Autorizar conta da Simone" : "Configurar integração de teste"}</h3></div><Badge tone={status?.configured ? "blue" : "gold"}>{status?.configured ? "CREDENCIAL SALVA" : "PENDENTE"}</Badge></div>
    {status?.configured ? <div><p className="drive-copy">Clique abaixo, entre no Gmail da Simone e permita o acesso solicitado. O portal criará automaticamente a pasta <b>PORTAL_CLIENTES_TESTE</b>.</p><a className="primary drive-link" href="/api/google/connect">Conectar Google Drive</a></div> : <form className="drive-form" onSubmit={save}><label>ID do cliente OAuth<input name="clientId" required autoComplete="off" placeholder="...apps.googleusercontent.com" /></label><label>Segredo do cliente OAuth<input name="clientSecret" type="password" required autoComplete="new-password" placeholder="Digite diretamente aqui" /></label><button className="primary" disabled={saving}>{saving ? "Protegendo..." : "Salvar credencial com segurança"}</button></form>}
  </section>;
}

function ContractsAdmin({ flash }: { flash: (s: string) => void }) {
  type ContractRow={id:string;request_id:string;file_name:string;client_name:string;client_email:string;status:string;returned_count:number;expires_at:number};
  const [contracts,setContracts]=useState<ContractRow[]>([]); const [saving,setSaving]=useState(false); const [link,setLink]=useState(""); const [emailNotice,setEmailNotice]=useState(""); const [selected,setSelected]=useState<string|null>(null);
  async function load(){const response=await fetch("/api/contracts",{cache:"no-store"});const result=await response.json() as {contracts?:ContractRow[];error?:string};if(!response.ok)return flash(result.error||"Não foi possível consultar os contratos.");setContracts(result.contracts||[]);}
  useEffect(()=>{load();},[]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setSaving(true);setLink("");const form=new FormData(event.currentTarget);form.set("sendEmail",String(form.get("sendEmail")==="on"));const response=await fetch("/api/contracts",{method:"POST",body:form});const result=await response.json() as {link?:string;emailSent?:boolean;emailError?:string;error?:string};setSaving(false);if(!response.ok||!result.link)return flash(result.error||"Não foi possível enviar o contrato.");setLink(result.link);setEmailNotice(result.emailSent?"E-mail enviado ao cliente.":`Link criado, mas o e-mail não foi enviado: ${result.emailError||"copie e encaminhe manualmente."}`);flash(result.emailSent?"Contrato disponibilizado e enviado por e-mail.":"Contrato disponibilizado; confira o aviso sobre o e-mail.");event.currentTarget.reset();await load();}
  async function copy(){await navigator.clipboard.writeText(link);flash("Link do contrato copiado.");}
  return <div className="content enter"><div className="section-head"><div><p>CONTRATOS</p><h2>Enviar contrato para assinatura</h2></div></div><div className="two-col"><form className="panel form-panel" onSubmit={submit}><ClientFields/><label className="dropzone"><b>Selecione o contrato em PDF</b><span>O cliente poderá visualizar, baixar e devolver assinado.</span><input name="file" type="file" accept="application/pdf" required /></label><label>Validade do link<select name="hours" defaultValue="72"><option value="24">24 horas</option><option value="48">48 horas</option><option value="72">3 dias</option><option value="168">7 dias</option></select></label><label className="send-email-choice"><input type="checkbox" name="sendEmail" defaultChecked/><span><strong>Enviar o link por e-mail</strong><small>O link também ficará disponível para copiar.</small></span></label><button className="primary full" disabled={saving}>{saving?"Enviando contrato...":"Disponibilizar contrato"}</button>{link&&<div className="generated-link"><strong>Link criado</strong><input readOnly value={link}/><button type="button" className="secondary" onClick={copy}>Copiar link</button><small>{emailNotice}</small></div>}</form><section className="panel"><div className="panel-title"><div><p>FLUXO</p><h3>Como funciona</h3></div></div><ol className="steps"><li><b>1</b><span><strong>Simone envia o contrato</strong><small>O PDF fica organizado na pasta do cliente.</small></span></li><li><b>2</b><span><strong>Cliente recebe o link</strong><small>Visualiza ou baixa o contrato para assinar.</small></span></li><li><b>3</b><span><strong>Cliente devolve assinado</strong><small>O retorno aparece para conferência no painel.</small></span></li></ol></section></div><section className="panel request-history"><div className="panel-title"><div><p>ACOMPANHAMENTO</p><h3>Contratos recentes</h3></div><button onClick={load}>Atualizar</button></div>{contracts.length?contracts.map(item=><article key={item.id}><div><strong>{item.client_name}</strong><small>{item.client_email}</small><small>{item.file_name}</small></div><div className="request-row-actions"><Badge tone={item.status==="approved"?"green":item.returned_count?"blue":"gold"}>{item.status==="approved"?"APROVADO":item.returned_count?"DEVOLVIDO":"AGUARDANDO"}</Badge>{item.returned_count>0&&<button className="secondary" onClick={()=>setSelected(item.request_id)}>Conferir</button>}</div></article>):<div className="empty-drive">Nenhum contrato enviado ainda.</div>}</section>{selected&&<RequestReview requestId={selected} flash={flash} onClose={()=>{setSelected(null);load();}}/>}</div>;
}

function ProcessesAdmin({ flash }: { flash: (s: string) => void }) {
  return <div className="content enter"><div className="section-head"><div><p>ACOMPANHAMENTO</p><h2>Atualização dos atendimentos</h2></div></div><div className="process-grid">{clients.slice(0,3).map((c,i)=><article className="panel" key={c.name}><div className="process-head"><span className="avatar">{c.initials}</span><div><strong>{c.name}</strong><small>{c.matter}</small></div></div><label>Status atual<select defaultValue={i===0 ? "Documentação em análise" : i===1 ? "Aguardando providência" : "Protocolado"}><option>Documentação em análise</option><option>Aguardando providência</option><option>Protocolado</option><option>Aguardando decisão</option><option>Concluído</option></select></label><label>Mensagem visível ao cliente<textarea defaultValue="Estamos conferindo as informações recebidas. Avisaremos caso seja necessário algum documento adicional." /></label><button className="primary full" onClick={() => flash(`Acompanhamento de ${c.name} atualizado (simulação).`)}>Salvar atualização</button></article>)}</div></div>;
}

function ClientView({ tab, setTab, flash, generated, setGenerated }: { tab: ClientTab; setTab: (t: ClientTab) => void; flash: (s: string) => void; generated: boolean; setGenerated: (b: boolean) => void }) {
  if (tab === "documentos") return <ClientDocuments flash={flash} />;
  if (tab === "procuracao") return <PowerOfAttorney flash={flash} generated={generated} setGenerated={setGenerated} />;
  if (tab === "contrato") return <ClientContract flash={flash} />;
  if (tab === "processo") return <ClientTracking />;
  return <div className="content enter"><div className="client-welcome"><p>OLÁ, MARIANA</p><h2>Seu atendimento, organizado em um só lugar.</h2><span>Confira abaixo o que precisa da sua atenção.</span></div><div className="progress-card panel"><div><p>SEU PROGRESSO</p><h3>3 de 5 etapas concluídas</h3></div><div className="progress"><i style={{width:"60%"}}></i></div><strong>60%</strong></div><div className="client-actions"><button onClick={() => setTab("documentos")}><span>D</span><div><Badge>1 PENDÊNCIA</Badge><h3>Enviar documentos</h3><p>Envie o comprovante relacionado ao seu caso.</p></div><b>→</b></button><button onClick={() => setTab("procuracao")}><span>P</span><div><Badge tone="blue">PRÓXIMA ETAPA</Badge><h3>Gerar procuração</h3><p>Preencha seus dados e confira o documento.</p></div><b>→</b></button><button onClick={() => setTab("contrato")}><span>C</span><div><Badge tone="green">DISPONÍVEL</Badge><h3>Contrato de honorários</h3><p>Documento disponibilizado pelo escritório.</p></div><b>→</b></button></div><ClientTracking compact /></div>;
}

function ClientDocuments({ flash }: { flash: (s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true);
    const form = new FormData(); form.set("file", file); form.set("clientName", "Mariana Silva");
    const response = await fetch("/api/google/upload", { method: "POST", body: form });
    const result = await response.json() as { error?: string; name?: string };
    setUploading(false); event.target.value = "";
    flash(response.ok ? `${result.name} enviado para a pasta Mariana Silva.` : (result.error || "Não foi possível enviar o arquivo."));
  }
  return <div className="content enter"><div className="section-head"><div><p>MEUS DOCUMENTOS</p><h2>Envie os arquivos solicitados</h2></div></div><section className="panel upload-list"><div><span className="doc-icon">D</span><div><strong>Documento de identificação</strong><small>RG ou CNH - frente e verso</small></div><Badge tone="green">RECEBIDO</Badge><button onClick={() => flash("Documento aberto em modo de demonstração.")}>Visualizar</button></div><div><span className="doc-icon">D</span><div><strong>Comprovante de endereço</strong><small>Emitido nos últimos 90 dias</small></div><Badge tone="green">APROVADO</Badge><button onClick={() => flash("Documento aberto em modo de demonstração.")}>Visualizar</button></div><div className="pending-row"><span className="doc-icon">D</span><div><strong>Comprovante relacionado ao caso</strong><small>PDF, JPG ou PNG - até 10 MB</small></div><Badge>{uploading ? "ENVIANDO" : "PENDENTE"}</Badge><label className="small-upload">{uploading ? "Aguarde..." : "Selecionar arquivo"}<input type="file" accept="application/pdf,image/jpeg,image/png" disabled={uploading} onChange={upload} /></label></div></section><div className="safe-note"><b>Teste controlado do Google Drive</b><span>Envie somente um arquivo fictício. Ele será armazenado em PORTAL_CLIENTES_TESTE / Mariana Silva.</span></div></div>;
}

function PowerOfAttorney({ flash, generated, setGenerated }: { flash: (s: string) => void; generated: boolean; setGenerated: (b: boolean) => void }) {
  if (generated) return <div className="content enter"><div className="section-head"><div><p>PROCURAÇÃO GERADA</p><h2>Confira antes de assinar</h2></div><Badge>AGUARDANDO ASSINATURA</Badge></div><div className="document-preview panel"><h3>PROCURAÇÃO</h3><p><b>OUTORGANTE:</b> MARIANA DE SOUZA SILVA, brasileira, casada, comerciante, inscrita no CPF nº 123.456.789-00, residente e domiciliada em Cuiabá/MT.</p><p><b>OUTORGADA:</b> profissional indicada pelo escritório JUNQUEIRA DE MIRANDA ADVOCACIA, com qualificação constante no modelo oficial.</p><p><b>PODERES:</b> poderes previstos no modelo revisado pelo escritório para representação no atendimento jurídico informado.</p><p>Cuiabá/MT, 09 de agosto de 2026.</p><div className="signature-line">Mariana de Souza Silva - Outorgante</div></div><div className="button-row center"><button className="secondary" onClick={() => setGenerated(false)}>Corrigir meus dados</button><button className="primary" onClick={() => flash("O método de assinatura segura ainda será definido. Nenhuma assinatura foi aplicada.")}>Prosseguir para assinatura</button></div></div>;
  return <div className="content enter"><div className="section-head"><div><p>GERADOR DE PROCURAÇÃO</p><h2>Confirme seus dados pessoais</h2></div></div><section className="panel power-form"><div className="form-grid"><label>Nome completo<input defaultValue="Mariana de Souza Silva" /></label><label>CPF<input defaultValue="123.456.789-00" /></label><label>Nacionalidade<input defaultValue="Brasileira" /></label><label>Estado civil<select defaultValue="Casada"><option>Casada</option><option>Solteira</option><option>Divorciada</option><option>Viúva</option></select></label><label>Profissão<input defaultValue="Comerciante" /></label><label>Documento de identidade<input defaultValue="RG 1234567 SSP/MT" /></label><label className="wide">Endereço completo<input defaultValue="Rua Exemplo, 123 - Cuiabá/MT" /></label></div><div className="declaration"><input type="checkbox" id="truth" defaultChecked/><label htmlFor="truth">Declaro que conferi os dados acima e que as informações estão corretas.</label></div><button className="primary full" onClick={() => setGenerated(true)}>Gerar procuração para conferência</button></section></div>;
}

function ClientContract({ flash }: { flash: (s: string) => void }) {
  return <div className="content enter"><div className="section-head"><div><p>CONTRATO</p><h2>Documento disponibilizado pelo escritório</h2></div></div><section className="panel contract-card"><span className="pdf">PDF</span><div><h3>Contrato de honorários advocatícios</h3><p>Enviado por Simone Miranda em 08 de agosto de 2026</p><Badge tone="blue">DISPONÍVEL PARA CONFERÊNCIA</Badge></div><button className="primary" onClick={() => flash("Download simulado. O arquivo real será disponibilizado após a integração.")}>Baixar contrato</button></section><div className="safe-note"><b>Assinatura em estudo</b><span>Na primeira versão, o cliente poderá baixar o contrato e enviar a versão assinada. A assinatura dentro do portal será avaliada depois.</span></div></div>;
}

function ClientTracking({ compact = false }: { compact?: boolean }) {
  const block = <section className={`panel tracking ${compact ? "compact" : ""}`}><div className="panel-title"><div><p>ACOMPANHAMENTO</p><h3>Situação do atendimento</h3></div><Badge tone="blue">DOCUMENTAÇÃO EM ANÁLISE</Badge></div><div className="track-line"><div className="done"><i>✓</i><span><strong>Atendimento iniciado</strong><small>03 ago 2026</small></span></div><div className="done"><i>✓</i><span><strong>Documentos recebidos</strong><small>08 ago 2026</small></span></div><div className="current"><i>3</i><span><strong>Conferência pelo escritório</strong><small>Estamos analisando os documentos enviados.</small></span></div><div><i>4</i><span><strong>Próxima providência</strong><small>Você receberá um aviso pelo portal.</small></span></div></div></section>;
  if (compact) return block;
  return <div className="content enter"><div className="section-head"><div><p>MEU ATENDIMENTO</p><h2>Acompanhe as atualizações</h2></div></div>{block}<div className="update-box"><span>ÚLTIMA ATUALIZAÇÃO - 09 AGO 2026, 09:50</span><p>Seus documentos estão sendo conferidos. Caso seja necessário algum complemento, enviaremos uma solicitação por este portal.</p></div></div>;
}
