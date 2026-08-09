import type { Metadata } from "next";
import Link from "next/link";
import FraudScreeningForm from "./FraudScreeningForm";

export const metadata: Metadata = {
  title: "Fraudes bancárias | Junqueira de Miranda Advocacia",
  description:
    "Orientação jurídica e triagem inicial para fraudes bancárias, golpes do Pix, empréstimos não contratados e movimentações não reconhecidas.",
  robots: { index: false, follow: true },
};

const situations = [
  ["01", "Golpe do Pix", "Transferências realizadas após falsa central, falso funcionário ou outra forma de indução."],
  ["02", "Empréstimo fraudulento", "Empréstimo, consignado ou conta aberta sem solicitação ou autorização."],
  ["03", "Cartão ou compra", "Cartão clonado, compra não reconhecida ou utilização indevida de dados bancários."],
  ["04", "Conta movimentada", "Conta invadida, valores retirados, operações fora do perfil ou bloqueio de recursos."],
];

export default function FraudesBancarias() {
  return (
    <main className="landing-page compact-landing fraud-landing">
      <header className="site-header landing-header">
        <Link className="brand" href="/" aria-label="Junqueira de Miranda Advocacia — página inicial">
          <img className="brand-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span className="brand-oab">OAB/MT 29.103-O</span>
        </Link>
        <Link className="landing-home-link" href="/">Conheça o escritório <span>→</span></Link>
        <a className="header-cta" href="#triagem">Iniciar triagem</a>
      </header>

      <section className="hero landing-hero compact-hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Direito Bancário e do Consumidor</p>
          <h1>Fraudes bancárias.<br /><em>Informação e análise para agir com segurança.</em></h1>
          <p className="hero-text">
            Orientação jurídica em Cuiabá e Várzea Grande para golpes do Pix, empréstimos não contratados, cartões clonados e movimentações bancárias não reconhecidas.
          </p>
          <div className="hero-actions">
            <a className="button button-gold" href="#triagem">Iniciar triagem do caso</a>
            <a className="text-link" href="#situacoes">Entenda as situações <span>↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Características do atendimento">
            <span>Análise individual</span><span>Triagem objetiva</span><span>Atuação responsável</span>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Advogada da Junqueira de Miranda Advocacia em ambiente profissional" />
      </section>

      <section className="compact-situations" id="situacoes">
        <div className="compact-heading">
          <p className="eyebrow">O que aconteceu?</p>
          <h2>Identifique a situação mais próxima do seu caso.</h2>
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

      <section className="fraud-screening-section" id="triagem">
        <div className="fraud-screening-copy">
          <p className="eyebrow light">Triagem inicial</p>
          <h2>Alguns detalhes são essenciais para avaliar a situação.</h2>
          <p>
            Nem toda fraude gera automaticamente responsabilidade da instituição financeira. A análise considera como a operação ocorreu, o comportamento das movimentações, as medidas de segurança adotadas, a comunicação ao banco e os documentos disponíveis.
          </p>
          <div className="fraud-action-note">
            <strong>Se o golpe acabou de acontecer</strong>
            <p>Comunique imediatamente o banco, registre a contestação e, quando envolver Pix, solicite a abertura do Mecanismo Especial de Devolução. A rapidez pode aumentar a possibilidade de bloqueio dos valores.</p>
          </div>
          <p className="fraud-office-signature">Junqueira de Miranda Advocacia<br /><span>OAB/MT 29.103-O</span></p>
        </div>
        <div className="fraud-screening-card">
          <p className="eyebrow">Conte o que aconteceu</p>
          <h2>Preencha antes de iniciar o contato.</h2>
          <FraudScreeningForm />
        </div>
      </section>

      <section className="contact compact-contact fraud-final-note">
        <p className="eyebrow light">Informação jurídica</p>
        <h2>Cada fraude exige uma análise própria.</h2>
        <p>A existência do golpe, isoladamente, não garante ressarcimento ou indenização. A responsabilidade depende dos fatos e das provas de cada situação.</p>
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

      <a className="floating-contact" href="#triagem" aria-label="Iniciar triagem sobre fraude bancária">
        <span aria-hidden="true">↗</span>
        Iniciar triagem
      </a>
    </main>
  );
}
