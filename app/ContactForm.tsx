"use client";

import { FormEvent, useEffect, useState } from "react";

const whatsappNumber = "5565996038916";
const areas = [
  "Direito Civil",
  "Direito de Família",
  "Pensão alimentícia",
  "Divórcio",
  "Fraudes bancárias e golpes financeiros",
  "Direito Imobiliário",
  "Consultoria Preventiva",
  "Outro assunto",
];

type ContactFormProps = {
  className?: string;
  children: React.ReactNode;
  area?: string;
  source?: string;
  ariaLabel?: string;
};

export default function ContactForm({ className, children, area = "", source = "site", ariaLabel }: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedArea, setSelectedArea] = useState(area);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openForm() {
    setSelectedArea(area);
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gtag = (window as Window & {
      gtag?: (...args: unknown[]) => void;
    }).gtag;
    gtag?.("event", "generate_lead", {
      send_to: "G-39N6Z3SMD7",
      method: "whatsapp",
      contact_area: selectedArea,
      contact_source: source,
      transport_type: "beacon",
    });
    const sourceMessage = source === "campanha-pensao"
      ? "Olá, encontrei a página sobre pensão alimentícia da Junqueira de Miranda pelo Google."
      : source === "campanha-divorcio"
        ? "Olá, encontrei a página sobre divórcio da Junqueira de Miranda pelo Google."
        : "Olá, vim pelo site da Junqueira de Miranda Advocacia.";
    const message = [
      sourceMessage,
      `Meu nome é ${name.trim()}.`,
      `Assunto: ${selectedArea}.`,
      `Descrição: ${description.trim()}`,
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      <button type="button" className={className} onClick={openForm} aria-label={ariaLabel}>
        {children}
      </button>

      {open && (
        <div className="contact-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title">
            <button type="button" className="contact-modal-close" onClick={() => setOpen(false)} aria-label="Fechar formulário">×</button>
            <p className="eyebrow">Atendimento pelo WhatsApp</p>
            <h2 id="contact-title">Como podemos ajudar?</h2>
            <p className="contact-modal-intro">Preencha brevemente os dados abaixo. Sua mensagem será preparada no WhatsApp para você revisar e enviar.</p>

            <form onSubmit={submit}>
              <label>
                Seu nome
                <input value={name} onChange={(event) => setName(event.target.value)} required autoFocus placeholder="Digite seu nome" />
              </label>
              <label>
                Assunto do atendimento
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)} required>
                  <option value="" disabled>Selecione uma opção</option>
                  {areas.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Conte brevemente o que precisa
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} placeholder="Descreva sua situação de forma resumida" />
              </label>
              <div className="contact-attachment-note">
                <strong>Precisa enviar fotos ou documentos?</strong>
                <span>Após iniciar a conversa, você poderá anexá-los diretamente pelo WhatsApp.</span>
              </div>
              <button type="submit" className="button button-gold contact-submit">Continuar no WhatsApp</button>
              <p className="contact-privacy">As informações serão usadas apenas para iniciar seu atendimento no WhatsApp.</p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
