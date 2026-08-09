import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "../ContactForm";

export const metadata: Metadata = {
  title: "Pensão alimentícia | Junqueira de Miranda Advocacia",
  description:
    "Informações e orientação jurídica sobre fixação, cobrança, revisão e exoneração de pensão alimentícia em Cuiabá e Várzea Grande.",
  robots: { index: false, follow: true },
};

const situations = [
  ["01", "Pedir pensão", "Quando a obrigação ainda não foi estabelecida formalmente."],
  ["02", "Cobrar atrasados", "Quando existem parcelas vencidas ou pagamentos irregulares."],
  ["03", "Revisar o valor", "Quando as necessidades ou as condições financeiras mudaram."],
  ["04", "Avaliar exoneração", "Quando é necessário analisar o encerramento da obrigação."],
];

export default function PensaoAlimenticia() {
  return (
    <main className="landing-page compact-landing">
      <header className="site-header landing-header">
        <Link className="brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="brand-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span className="brand-oab">OAB/MT 29.103-O</span>
        </Link>
        <Link className="landing-home-link" href="/">Conheça o escritório <span>→</span></Link>
        <ContactForm className="header-cta" area="Pensão alimentícia" source="campanha-pensao">Solicitar atendimento</ContactForm>
      </header>

      <section className="hero landing-hero compact-hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Direito de Família</p>
          <h1>Pensão alimentícia.<br /><em>Entenda os caminhos possíveis.</em></h1>
          <p className="hero-text">
            Orientação jurídica em Cuiabá e Várzea Grande para pedidos, cobranças, revisões e exonerações de pensão alimentícia.
          </p>
          <div className="hero-actions">
            <ContactForm className="button button-gold" area="Pensão alimentícia" source="campanha-pensao">Solicitar atendimento</ContactForm>
            <a className="text-link" href="#situacoes">Veja como podemos orientar <span>↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Características do atendimento">
            <span>Análise individual</span><span>Orientação clara</span><span>Atuação responsável</span>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Advogada da Junqueira de Miranda Advocacia em ambiente profissional" />
      </section>

      <section className="compact-situations" id="situacoes">
        <div className="compact-heading">
          <p className="eyebrow">Em qual situação você se encontra?</p>
          <h2>Orientação para diferentes momentos da pensão alimentícia.</h2>
        </div>
        <div className="compact-card-grid">
          {situations.map(([number, title, text]) => (
            <article className="compact-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="compact-information">
        <div className="compact-info-main">
          <p className="eyebrow light">Informação importante</p>
          <h2>A pensão não possui uma porcentagem única.</h2>
          <p>
            Não existe uma regra automática de 30% para todos os casos. O valor é analisado conforme as necessidades de quem recebe, as possibilidades de quem paga e as circunstâncias da família.
          </p>
          <p>
            Filhos menores são os beneficiários mais frequentes, mas filhos maiores, gestantes, ex-cônjuges e outros familiares podem exigir avaliação específica. O vínculo familiar, sozinho, não determina automaticamente o direito.
          </p>
        </div>
        <aside className="compact-office-card">
          <p className="eyebrow">Junqueira de Miranda Advocacia</p>
          <h2>Seu caso merece uma análise cuidadosa.</h2>
          <p>
            Atendimento conduzido com clareza, discrição e atenção às particularidades de cada família.
          </p>
          <strong>OAB/MT 29.103-O</strong>
          <ContactForm className="button button-gold" area="Pensão alimentícia" source="campanha-pensao">Relatar minha situação</ContactForm>
        </aside>
      </section>

      <section className="contact compact-contact" id="contato">
        <p className="eyebrow light">Atendimento jurídico</p>
        <h2>Precisa entender quais medidas podem ser aplicáveis ao seu caso?</h2>
        <p>Relate resumidamente sua situação para solicitar atendimento jurídico.</p>
        <ContactForm className="button button-light" area="Pensão alimentícia" source="campanha-pensao">Solicitar atendimento pelo WhatsApp</ContactForm>
        <Link className="landing-office-link" href="/">Conheça o escritório e outras áreas de atuação →</Link>
      </section>

      <footer className="compact-footer">
        <Link className="footer-brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="footer-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span>OAB/MT 29.103-O</span>
        </Link>
        <p>Conteúdo geral e informativo. A orientação depende da análise individual de cada situação.</p>
        <p>© 2026 Junqueira de Miranda Advocacia</p>
      </footer>

      <ContactForm className="floating-contact" area="Pensão alimentícia" source="campanha-pensao" ariaLabel="Solicitar atendimento sobre pensão alimentícia">
        <span aria-hidden="true">↗</span>
        Solicitar atendimento
      </ContactForm>
    </main>
  );
}
