import ContactForm from "./ContactForm";

const services = [
  {
    number: "01",
    title: "Direito Civil",
    text: "Orientação jurídica para relações contratuais, obrigações, responsabilidade civil e proteção de direitos.",
  },
  {
    number: "02",
    title: "Direito de Família",
    text: "Atuação sensível e estratégica em divórcio, guarda, alimentos, inventário e planejamento sucessório.",
  },
  {
    number: "03",
    title: "Direito Imobiliário",
    text: "Segurança jurídica em contratos, regularização, locações, compra e venda e conflitos imobiliários.",
  },
  {
    number: "04",
    title: "Consultoria Preventiva",
    text: "Análise de riscos e construção de soluções antes que situações complexas se transformem em litígios.",
  },
];

const values = [
  ["Segurança", "Decisões fundamentadas e condução responsável em cada etapa."],
  ["Estratégia", "Cada caso é analisado de forma individual, clara e objetiva."],
  ["Técnica", "Profundidade jurídica aplicada a soluções verdadeiramente úteis."],
  ["Confiança", "Relacionamentos pautados por transparência, respeito e proximidade."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Junqueira de Miranda Advocacia — início">
          <img className="brand-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span className="brand-oab">OAB/MT 29.103-O</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#atuacao">Áreas de atuação</a>
          <a href="#escritorio">O escritório</a>
          <a href="#contato">Contato</a>
        </nav>
        <ContactForm className="header-cta">Fale conosco</ContactForm>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Advocacia estratégica e personalizada</p>
          <h1>Direito com profundidade.<br /><em>Soluções com estratégia.</em></h1>
          <p className="hero-text">
            Atuação jurídica técnica, próxima e responsável para proteger seus direitos e conduzir decisões importantes com segurança.
          </p>
          <div className="hero-actions">
            <ContactForm className="button button-gold">Fale conosco</ContactForm>
            <a className="text-link" href="#atuacao">Conheça nossa atuação <span>→</span></a>
          </div>
          <div className="hero-proof" aria-label="Pilares do escritório">
            <span>Análise técnica</span><span>Estratégia individualizada</span><span>Atuação responsável</span>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Advogada da Junqueira de Miranda Advocacia em ambiente profissional" />
      </section>

      <section className="intro" id="escritorio">
        <div>
          <p className="eyebrow">Junqueira de Miranda Advocacia</p>
          <h2>Clareza para compreender.<br />Estratégia para decidir.</h2>
        </div>
        <div className="intro-copy">
          <p>
            Acreditamos que uma atuação jurídica de excelência começa pela escuta. Cada situação exige compreensão profunda, orientação acessível e uma estratégia construída com responsabilidade.
          </p>
          <p>
            Nosso compromisso é traduzir o Direito com clareza e conduzir cada demanda com técnica, discrição e atenção aos detalhes.
          </p>
        </div>
      </section>

      <section className="practice" id="atuacao">
        <div className="section-heading">
          <p className="eyebrow light">Áreas de atuação</p>
          <h2>Soluções jurídicas pensadas para cada realidade.</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <ContactForm className="service-contact" area={service.title} ariaLabel={`Falar conosco sobre ${service.title}`}>Fale conosco →</ContactForm>
            </article>
          ))}
        </div>
      </section>

      <section className="values">
        <div className="values-image">
          <div className="quote">
            <span>“</span>
            <p>Nosso compromisso é traduzir o Direito com clareza, técnica e responsabilidade.</p>
          </div>
        </div>
        <div className="values-copy">
          <p className="eyebrow">Princípios que orientam</p>
          <h2>Uma atuação construída sobre confiança.</h2>
          <div className="value-list">
            {values.map(([title, text]) => (
              <div className="value-item" key={title}>
                <span aria-hidden="true">◇</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="contato">
        <p className="eyebrow light">Atendimento personalizado</p>
        <h2>Seu caso merece uma análise cuidadosa.</h2>
        <p>Entre em contato para apresentar sua situação e receber uma orientação inicial sobre os próximos passos.</p>
        <ContactForm className="button button-light">Fale conosco pelo WhatsApp</ContactForm>
        <a className="contact-email" href="mailto:junqueirademiranda@gmail.com">junqueirademiranda@gmail.com</a>
      </section>

      <footer>
        <a className="footer-brand" href="#inicio" aria-label="Junqueira de Miranda Advocacia — voltar ao início">
          <img className="footer-logo" src="/images/logo-oficial-junqueira-de-miranda.png" alt="Junqueira de Miranda Advocacia" />
          <span>OAB/MT 29.103-O</span>
        </a>
        <p>Análise técnica. Estratégia individualizada. Atuação responsável.</p>
        <p>© 2026 Junqueira de Miranda Advocacia</p>
      </footer>

      <ContactForm className="floating-contact" ariaLabel="Fale conosco pelo WhatsApp">
        <span aria-hidden="true">↗</span>
        Fale conosco
      </ContactForm>
    </main>
  );
}
