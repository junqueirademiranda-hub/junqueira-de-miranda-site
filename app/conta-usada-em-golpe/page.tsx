import type { Metadata } from "next";
import Link from "next/link";
import AccountScreeningForm from "./AccountScreeningForm";

export const metadata: Metadata = {
  title: "Conta utilizada em golpe | Junqueira de Miranda Advocacia",
  description: "Orientação jurídica em Cuiabá e Várzea Grande para pessoas intimadas, investigadas ou processadas após a utilização de sua conta bancária por terceiros.",
  robots: { index: false, follow: true },
};

const situations = [
  ["01", "Intimação", "Você foi chamado para prestar depoimento na delegacia ou em outro procedimento."],
  ["02", "Investigação ou processo", "Seu nome aparece em investigação ou já existe um processo criminal."],
  ["03", "Conta bloqueada", "A conta ou os valores foram bloqueados em razão das movimentações questionadas."],
  ["04", "Uso por terceiros", "Você recebeu ou transferiu valores a pedido de outra pessoa."],
];

const guidance = [
  "Não apague conversas, áudios, extratos ou comprovantes.",
  "Não combine versões com outras pessoas envolvidas.",
  "Não ignore intimações, audiências ou prazos.",
  "Preserve os registros originais das movimentações.",
  "Busque orientação antes de prestar declarações detalhadas.",
];

export default function ContaUsadaEmGolpe() {
  return (
    <main className="landing-page compact-landing account-landing">
      <header className="site-header landing-header">
        <Link className="brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="brand-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span className="brand-oab">OAB/MT 29.103-O</span>
        </Link>
        <span className="campaign-location">Atendimento em Cuiabá e Várzea Grande — MT</span>
        <a className="header-cta" href="#triagem">Solicitar atendimento</a>
      </header>

      <section className="hero landing-hero compact-hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Defesa criminal</p>
          <h1>Sua conta bancária foi usada para receber dinheiro de um golpe?</h1>
          <p className="hero-text">
            Recebeu uma intimação, está sendo investigado ou responde a processo após permitir que outra pessoa utilizasse sua conta?
          </p>
          <p className="landing-hero-note"><strong>Entenda sua situação antes de prestar declarações ou perder prazos.</strong></p>
          <div className="hero-actions">
            <a className="button button-gold" href="#triagem">Solicitar atendimento</a>
            <a className="text-link" href="#situacoes">Veja se atendemos seu caso <span>↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Informações do atendimento">
            <span>Cuiabá e Várzea Grande</span><span>Análise individual</span><span>Atuação responsável</span>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Advogada da Junqueira de Miranda Advocacia em ambiente profissional" />
      </section>

      <section className="compact-situations" id="situacoes">
        <div className="compact-heading">
          <p className="eyebrow">Situações atendidas</p>
          <h2>Você está passando por alguma destas situações?</h2>
        </div>
        <div className="compact-card-grid">
          {situations.map(([number, title, text]) => (
            <article className="compact-card" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="account-explainer">
        <div>
          <p className="eyebrow light">Ponto essencial</p>
          <h2>Ter a conta envolvida não significa condenação automática.</h2>
          <p>A responsabilidade depende do que a pessoa sabia, de sua participação e das provas existentes. Conversas, extratos, comprovantes e a forma como os valores foram movimentados podem ser importantes para compreender a acusação e definir a defesa.</p>
        </div>
        <div className="account-guidance">
          <p className="eyebrow">O que fazer agora</p>
          {guidance.map((item) => <p key={item}><span>◇</span>{item}</p>)}
        </div>
      </section>

      <section className="fraud-screening-section" id="triagem">
        <div className="fraud-screening-copy">
          <p className="eyebrow light">Atendimento jurídico individualizado</p>
          <h2>Conte apenas as informações iniciais do seu caso.</h2>
          <p>A triagem identifica a fase do procedimento, a existência de prazo urgente e a situação envolvendo a utilização da conta. Os detalhes sensíveis devem ser tratados diretamente durante o atendimento.</p>
          <div className="fraud-action-note">
            <strong>Atenção</strong>
            <p>Uma explicação apresentada sem conhecer as provas existentes pode gerar contradições. Não ignore a intimação, mas compreenda sua situação antes de prestar declarações detalhadas.</p>
          </div>
          <p className="fraud-office-signature">Junqueira de Miranda Advocacia<br /><span>OAB/MT 29.103-O</span></p>
        </div>
        <div className="fraud-screening-card">
          <p className="eyebrow">Triagem inicial</p>
          <h2>Em qual situação você se encontra?</h2>
          <AccountScreeningForm />
        </div>
      </section>

      <section className="contact compact-contact fraud-final-note">
        <p className="eyebrow light">Não ignore prazos</p>
        <h2>Recebeu uma intimação ou descobriu que sua conta foi envolvida em um golpe?</h2>
        <p>Solicite a análise inicial para compreender as acusações, as provas existentes e os próximos passos possíveis.</p>
        <a className="button button-light" href="#triagem">Quero solicitar atendimento</a>
      </section>

      <footer className="compact-footer">
        <Link className="footer-brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="footer-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span>OAB/MT 29.103-O</span>
        </Link>
        <p>O envio das informações não garante contratação ou resultado. Cada caso depende da análise dos fatos, documentos e provas.</p>
        <p>© 2026 Junqueira de Miranda Advocacia</p>
      </footer>

      <a className="floating-contact" href="#triagem" aria-label="Solicitar atendimento sobre conta utilizada em golpe"><span aria-hidden="true">↗</span>Solicitar atendimento</a>
    </main>
  );
}
