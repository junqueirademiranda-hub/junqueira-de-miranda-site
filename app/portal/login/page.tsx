import Image from "next/image";

export default function AdminLogin() {
  return <main className="admin-login-page"><section className="admin-login-card"><Image src="/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" width={245} height={140} priority unoptimized /><p>ACESSO ADMINISTRATIVO</p><h1>Painel do escritório</h1><span>Entre com a conta Google autorizada para conferir solicitações, documentos e atendimentos.</span><a href="/api/admin/login">Entrar com Google</a><small>O acesso é restrito. Contas não autorizadas serão bloqueadas.</small></section></main>;
}
