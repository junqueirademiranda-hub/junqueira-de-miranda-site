"use client";

import { FormEvent, useState } from "react";

const whatsappNumber = "5565996038916";

export default function AccountScreeningForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [stage, setStage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [consent, setConsent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", "generate_lead", {
      send_to: "G-39N6Z3SMD7",
      method: "whatsapp",
      contact_area: "Defesa criminal — conta utilizada em golpe",
      contact_source: "campanha-conta-usada-em-golpe",
      transport_type: "beacon",
    });

    const message = [
      "Olá, encontrei a página da Junqueira de Miranda sobre conta utilizada em golpe pelo Google.",
      "",
      "TRIAGEM INICIAL",
      `Nome: ${name.trim()}`,
      `Cidade: ${city}`,
      `O que sabia sobre a finalidade: ${knowledge}`,
      `Fase do caso: ${stage}`,
      `Audiência ou prazo marcado: ${deadline}`,
      deadline === "Sim" ? `Data informada: ${deadlineDate}` : "",
    ].filter(Boolean).join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form className="fraud-screening-form" onSubmit={submit}>
      <div className="screening-field-row">
        <label>
          Seu nome
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Digite seu nome" />
        </label>
        <label>
          Cidade
          <select value={city} onChange={(event) => setCity(event.target.value)} required>
            <option value="" disabled>Selecione</option>
            <option>Cuiabá</option>
            <option>Várzea Grande</option>
          </select>
        </label>
      </div>

      <label>
        Quando permitiu o uso da conta, o que você sabia sobre a finalidade?
        <select value={knowledge} onChange={(event) => setKnowledge(event.target.value)} required>
          <option value="" disabled>Selecione a situação mais próxima</option>
          <option>Sabia a finalidade que me foi informada</option>
          <option>Não sabia para qual finalidade seria utilizada</option>
          <option>Informaram uma finalidade diferente da que realmente ocorreu</option>
          <option>Minha conta foi utilizada sem minha autorização</option>
          <option>Não tenho certeza</option>
          <option>Prefiro explicar durante o atendimento</option>
        </select>
      </label>

      <label>
        Em qual fase o caso se encontra?
        <select value={stage} onChange={(event) => setStage(event.target.value)} required>
          <option value="" disabled>Selecione uma opção</option>
          <option>Ainda não fui intimado(a)</option>
          <option>Recebi uma intimação para prestar depoimento</option>
          <option>Está em fase de investigação</option>
          <option>Já existe um processo judicial</option>
          <option>Minha conta ou meus valores foram bloqueados</option>
          <option>Não sei identificar a fase</option>
        </select>
      </label>

      <div className="screening-field-row">
        <label>
          Existe audiência ou prazo marcado?
          <select value={deadline} onChange={(event) => setDeadline(event.target.value)} required>
            <option value="" disabled>Selecione</option>
            <option>Sim</option>
            <option>Não</option>
            <option>Não sei</option>
          </select>
        </label>
        {deadline === "Sim" && (
          <label>
            Qual é a data?
            <input type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} required />
          </label>
        )}
      </div>

      <label className="screening-consent">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>Autorizo o uso destas informações exclusivamente para contato e verificação inicial da possibilidade de atendimento.</span>
      </label>

      <div className="screening-security-note">
        <strong>Não envie dados bancários sensíveis.</strong>
        <span>Nunca informe senhas, códigos, token, número completo do cartão ou credenciais de acesso.</span>
      </div>

      <button type="submit" className="button button-gold screening-submit">Solicitar atendimento</button>
      <p className="screening-disclaimer">O envio não garante contratação ou resultado. A mensagem será aberta no WhatsApp para você revisar e enviar.</p>
    </form>
  );
}
