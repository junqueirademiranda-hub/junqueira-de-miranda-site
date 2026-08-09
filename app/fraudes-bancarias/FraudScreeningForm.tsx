"use client";

import { FormEvent, useState } from "react";

const whatsappNumber = "5565996038916";

export default function FraudScreeningForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState("");
  const [loss, setLoss] = useState("");
  const [operation, setOperation] = useState("");
  const [bankContact, setBankContact] = useState("");
  const [policeReport, setPoliceReport] = useState("");
  const [documents, setDocuments] = useState("");
  const [description, setDescription] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", "generate_lead", {
      send_to: "G-39N6Z3SMD7",
      method: "whatsapp",
      contact_area: "Fraudes bancárias e golpes financeiros",
      contact_source: "campanha-fraudes-bancarias",
      transport_type: "beacon",
    });

    const message = [
      "Olá, encontrei a página sobre fraudes bancárias da Junqueira de Miranda pelo Google.",
      "",
      "TRIAGEM INICIAL",
      `Nome: ${name.trim()}`,
      `Cidade: ${city.trim()}`,
      `Tipo de problema: ${problem}`,
      `Data aproximada: ${date}`,
      `Prejuízo aproximado: ${loss}`,
      `Como ocorreu: ${operation}`,
      `Contato com o banco: ${bankContact}`,
      `Boletim de ocorrência: ${policeReport}`,
      `Documentos disponíveis: ${documents}`,
      `Resumo: ${description.trim()}`,
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="fraud-screening-form" onSubmit={submit}>
      <div className="screening-field-row">
        <label>
          Seu nome
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Digite seu nome" />
        </label>
        <label>
          Sua cidade
          <input value={city} onChange={(event) => setCity(event.target.value)} required placeholder="Cuiabá, Várzea Grande..." />
        </label>
      </div>

      <label>
        Qual foi o problema?
        <select value={problem} onChange={(event) => setProblem(event.target.value)} required>
          <option value="" disabled>Selecione uma opção</option>
          <option>Golpe do Pix ou falsa central</option>
          <option>Empréstimo ou consignado não contratado</option>
          <option>Cartão clonado ou compra não reconhecida</option>
          <option>Conta invadida ou movimentação não reconhecida</option>
          <option>Conta bancária bloqueada com valores retidos</option>
          <option>Outro problema bancário</option>
        </select>
      </label>

      <div className="screening-field-row">
        <label>
          Data aproximada do ocorrido
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label>
          Prejuízo aproximado
          <select value={loss} onChange={(event) => setLoss(event.target.value)} required>
            <option value="" disabled>Selecione uma faixa</option>
            <option>Até R$ 1.000</option>
            <option>De R$ 1.001 a R$ 5.000</option>
            <option>De R$ 5.001 a R$ 20.000</option>
            <option>Acima de R$ 20.000</option>
            <option>Ainda não houve perda financeira</option>
          </select>
        </label>
      </div>

      <label>
        Como a operação aconteceu?
        <select value={operation} onChange={(event) => setOperation(event.target.value)} required>
          <option value="" disabled>Selecione a situação mais próxima</option>
          <option>Não reconheço nem autorizei a operação</option>
          <option>Realizei a operação após ser induzido por um golpista</option>
          <option>Minha conta ou cartão foi invadido ou clonado</option>
          <option>Foi aberto empréstimo ou conta usando meus dados</option>
          <option>Não sei informar como ocorreu</option>
        </select>
      </label>

      <div className="screening-field-row">
        <label>
          Você comunicou o banco?
          <select value={bankContact} onChange={(event) => setBankContact(event.target.value)} required>
            <option value="" disabled>Selecione uma opção</option>
            <option>Sim, tenho protocolo ou contestação</option>
            <option>Sim, mas não tenho o protocolo</option>
            <option>Ainda não comuniquei</option>
          </select>
        </label>
        <label>
          Registrou boletim de ocorrência?
          <select value={policeReport} onChange={(event) => setPoliceReport(event.target.value)} required>
            <option value="" disabled>Selecione uma opção</option>
            <option>Sim</option>
            <option>Não</option>
          </select>
        </label>
      </div>

      <label>
        Quais documentos você possui?
        <select value={documents} onChange={(event) => setDocuments(event.target.value)} required>
          <option value="" disabled>Selecione uma opção</option>
          <option>Extratos, comprovantes, protocolos e conversas</option>
          <option>Tenho apenas parte desses documentos</option>
          <option>Ainda não reuni os documentos</option>
        </select>
      </label>

      <label>
        Resuma o que aconteceu
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} placeholder="Explique de forma breve como percebeu a fraude e o que o banco respondeu" />
      </label>

      <div className="screening-security-note">
        <strong>Proteja seus dados.</strong>
        <span>Não informe senhas, códigos de segurança, token, número completo do cartão ou credenciais bancárias.</span>
      </div>

      <button type="submit" className="button button-gold screening-submit">Enviar triagem pelo WhatsApp</button>
      <p className="screening-disclaimer">O preenchimento não confirma a viabilidade do caso. As informações serão encaminhadas ao WhatsApp para análise inicial.</p>
    </form>
  );
}
