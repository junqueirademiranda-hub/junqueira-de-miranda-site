import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "../ContactForm";

export const metadata: Metadata = {
  title: "Divórcio | Junqueira de Miranda Advocacia",
  description:
    "Informações e orientação jurídica sobre divórcio consensual, litigioso, extrajudicial e questões relacionadas em Cuiabá e Várzea Grande.",
  robots: { index: false, follow: true },
};

const situations = [
  ["01", "Divórcio consensual", "Quando o casal concorda com o divórcio e busca organizar os demais termos."],
  ["02", "Divórcio litigioso", "Quando não existe acordo sobre bens, filhos, alimentos ou outras questões."],
  ["03", "Divórcio em cartório", "Quando a situação permite avaliar a realização pela via extrajudicial."],
  ["04", "Filhos e patrimônio", "Quando também é necessário tratar de guarda, convivência, pensão ou partilha."],
];

export default function Divorcio() {
  return (
    <main className="landing-page compact-landing">
      <header className="site-header landing-header">
        <Link className="brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="brand-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span className="brand-oab">OAB/MT 29.103-O</span>
        </Link>
        <Link className="landing-home-link" href="/">Conheça o escritório <span>→</span></Link>
        <ContactForm className="header-cta" area="Divórcio" source="campanha-divorcio">Solicitar atendimento</ContactForm>
      </header>

      <section className="hero landing-hero compact-hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Direito de Família</p>
          <h1>Divórcio.<br /><em>Clareza para conduzir uma decisão importante.</em></h1>
          <p className="hero-text">
            Orientação jurídica em Cuiabá e Várzea Grande para divórcios consensuais, litigiosos, extrajudiciais e questões relacionadas a filhos e patrimônio.
          </p>
          <div className="hero-actions">
            <ContactForm className="button button-gold" area="Divórcio" source="campanha-divorcio">Solicitar atendimento</ContactForm>
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
          <h2>Orientação para diferentes formas de conduzir o divórcio.</h2>
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
          <h2>O divórcio não depende da concordância do outro cônjuge.</h2>
          <p>
            A vontade de uma das partes é suficiente para pedir a dissolução do casamento. A falta de acordo pode tornar necessária a via judicial, mas não impede o divórcio.
          </p>
          <p>
            Questões como partilha de bens, guarda, convivência e pensão alimentícia precisam ser analisadas conforme o caso. A partilha não precisa, necessariamente, estar concluída antes da decretação do divórcio.
          </p>
          <p>
            Nos casos consensuais, também pode ser avaliada a via extrajudicial. Quando existem filhos menores ou incapazes, as questões relativas a guarda, convivência e alimentos devem estar previamente resolvidas judicialmente para que o divórcio possa ser formalizado em cartório.
          </p>
        </div>
        <aside className="compact-office-card">
          <p className="eyebrow">Junqueira de Miranda Advocacia</p>
          <h2>Seu caso merece uma análise cuidadosa.</h2>
          <p>
            Atendimento conduzido com clareza, discrição e atenção às particularidades de cada família.
          </p>
          <strong>OAB/MT 29.103-O</strong>
          <ContactForm className="button button-gold" area="Divórcio" source="campanha-divorcio">Relatar minha situação</ContactForm>
        </aside>
      </section>

      <section className="contact compact-contact" id="contato">
        <p className="eyebrow light">Atendimento jurídico</p>
        <h2>Precisa entender qual caminho pode ser adequado ao seu divórcio?</h2>
        <p>Relate resumidamente sua situação para solicitar atendimento jurídico.</p>
        <ContactForm className="button button-light" area="Divórcio" source="campanha-divorcio">Solicitar atendimento pelo WhatsApp</ContactForm>
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

      <ContactForm className="floating-contact" area="Divórcio" source="campanha-divorcio" ariaLabel="Solicitar atendimento sobre divórcio">
        <span aria-hidden="true">↗</span>
        Solicitar atendimento
      </ContactForm>
    </main>
  );
}
