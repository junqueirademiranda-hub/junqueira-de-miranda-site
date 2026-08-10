import Image from "next/image";

export default function PortalHome(){
  return <main className="access-page"><header className="access-brand"><Image src="/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" width={240} height={138} priority unoptimized/></header><section className="access-card"><p className="access-eyebrow">PORTAL SEGURO</p><div className="access-message"><h1>Portal de atendimento</h1><p>Para enviar documentos ou devolver um contrato, utilize o link individual encaminhado pelo escritório.</p><small>O acesso administrativo é restrito à equipe autorizada.</small></div></section><footer>Junqueira de Miranda Advocacia</footer></main>;
}
