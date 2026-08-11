import type { Metadata } from "next";
import AccountCampaignForm from "./AccountCampaignForm";

export const metadata: Metadata = {
  title: "Defesa para conta utilizada em golpe | Junqueira de Miranda",
  description: "Atendimento jurídico para clientes de Cuiabá, Várzea Grande e Rondonópolis que foram intimados, investigados ou processados após o uso de conta bancária por terceiros.",
  robots: { index: true, follow: true },
};

const situations = [
  "Recebeu uma intimação para prestar depoimento.",
  "Está sendo investigado ou processado.",
  "Teve a conta ou valores bloqueados.",
  "Recebeu e transferiu dinheiro a pedido de alguém.",
  "Permitiu que outra pessoa utilizasse sua conta sem conhecer a verdadeira finalidade.",
];

const guidance = [
  "Não apague conversas, áudios ou comprovantes.",
  "Não combine versões com outras pessoas.",
  "Preserve os extratos e registros bancários.",
  "Não ignore intimações, audiências ou prazos.",
  "Procure orientação antes de prestar declarações detalhadas.",
];

export default function DefesaContaGolpe() {
  return (
    <main className="campaign-v2">
      <header className="campaign-v2-header">
        <img src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
        <span>OAB/MT 29.103-O</span>
        <a href="#formulario">Solicitar atendimento</a>
      </header>

      <section className="campaign-v2-hero">
        <div className="campaign-v2-hero-copy">
          <p className="eyebrow">Defesa para quem teve a própria conta envolvida</p>
          <h1>Sua conta foi utilizada para receber ou transferir dinheiro relacionado a um golpe?</h1>
          <p>Esta página é destinada a quem teve a própria conta bancária envolvida e foi intimado, investigado, processado ou teve valores bloqueados.</p>
          <strong>Dependendo das provas e das circunstâncias, pode haver processo, medidas cautelares e condenação.</strong>
          <p className="campaign-v2-hero-warning">Não ignore uma intimação nem apresente uma versão dos fatos sem compreender as provas existentes.</p>
          <a className="button button-gold" href="#formulario">Preciso de orientação jurídica</a>
          <small>Atendimento jurídico em Cuiabá, Várzea Grande e Rondonópolis — MT, inclusive online.</small>
        </div>
        <div className="campaign-v2-hero-image" role="img" aria-label="Advogada em ambiente profissional com celular e documento" />
      </section>

      <section className="campaign-v2-situations">
        <div><p className="eyebrow">Identificação rápida</p><h2>Você está passando por alguma destas situações?</h2></div>
        <ul>{situations.map((item) => <li key={item}><span>◇</span>{item}</li>)}</ul>
      </section>

      <section className="campaign-v2-explanation">
        <div><p className="eyebrow light">Risco jurídico real</p><h2>A situação pode ser mais grave do que parece</h2></div>
        <div><p>Receber, movimentar ou transferir valores de origem criminosa pode colocar o titular da conta sob investigação e levar a acusações como estelionato ou lavagem de dinheiro.</p><p>A responsabilização, entretanto, não é automática. Ela depende do que a pessoa sabia, de sua intenção, de sua participação e das provas reunidas.</p><p>Conversas, extratos e comprovantes podem ser importantes para compreender a acusação. Uma explicação improvisada ou contraditória pode dificultar a defesa.</p><a className="button button-gold" href="#formulario">Relatar minha situação</a></div>
      </section>

      <section className="campaign-v2-guidance">
        <div className="campaign-v2-guidance-image" />
        <div><p className="eyebrow">Orientação imediata</p><h2>O que fazer agora?</h2><ul>{guidance.map((item) => <li key={item}><span>◇</span>{item}</li>)}</ul></div>
      </section>

      <section className="campaign-v2-lawyer">
        <div className="campaign-v2-lawyer-photo" role="img" aria-label="Advogada da Junqueira de Miranda Advocacia" />
        <div><p className="eyebrow light">Atendimento jurídico individualizado</p><h2>Uma análise cuidadosa para compreender o seu caso.</h2><p>Junqueira de Miranda Advocacia atua na análise de investigações e processos criminais relacionados à utilização de contas bancárias por terceiros.</p><p>Após a triagem, o escritório verificará a fase do caso, possíveis prazos e os documentos necessários. As informações iniciais serão tratadas exclusivamente para avaliar a possibilidade de atendimento.</p><strong>Junqueira de Miranda Advocacia<br /><span>OAB/MT 29.103-O</span></strong><small>Atendimento jurídico em Cuiabá, Várzea Grande e Rondonópolis — MT, inclusive online.</small></div>
      </section>

      <section className="campaign-v2-form" id="formulario">
        <div><p className="eyebrow light">Triagem inicial</p><h2>Conte brevemente em qual situação você se encontra</h2><p>Preencha somente as informações iniciais. Não envie senhas, códigos, dados bancários sensíveis ou detalhes sigilosos pelo formulário.</p></div>
        <div className="fraud-screening-card"><AccountCampaignForm /></div>
      </section>

      <section className="campaign-v2-final"><p className="eyebrow light">Não ignore prazos</p><h2>Recebeu uma intimação ou descobriu que sua conta foi envolvida em um golpe?</h2><p>Não ignore prazos nem apresente explicações sem compreender sua situação jurídica.</p><a className="button button-gold" href="#formulario">Quero solicitar atendimento</a><small>Este atendimento não é destinado à vítima que busca recuperar um Pix. O envio das informações não garante contratação ou resultado; cada caso depende da análise individual dos fatos, documentos e provas.</small></section>

      <footer className="campaign-v2-footer"><img src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" /><span>OAB/MT 29.103-O</span><p>© 2026 Junqueira de Miranda Advocacia</p></footer>
      <a className="floating-contact" href="#formulario"><span aria-hidden="true">↗</span>Solicitar atendimento</a>
    </main>
  );
}
