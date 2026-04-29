"use client";

import { FormEvent, useMemo, useState } from "react";
import { requestOptions } from "@/lib/mockData";
import type { BusinessType } from "@/lib/types";

const businessTypes = Object.keys(requestOptions) as BusinessType[];

export function LeadSimulator() {
  const [name, setName] = useState("Laura Steiner");
  const [phone, setPhone] = useState("+41 79 123 45 67");
  const [businessType, setBusinessType] = useState<BusinessType>("Garage");
  const [requestType, setRequestType] = useState(requestOptions.Garage[0]);
  const [message, setMessage] = useState("Ich habe vorhin angerufen. Mein Auto braucht moeglichst bald einen Termin.");
  const [submitted, setSubmitted] = useState(false);

  const availableRequests = useMemo(() => requestOptions[businessType], [businessType]);

  function handleBusinessTypeChange(value: BusinessType) {
    setBusinessType(value);
    setRequestType(requestOptions[value][0]);
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const summary = `${name} (${phone}) sucht Hilfe fuer ${requestType.toLowerCase()} im Bereich ${businessType}.`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="premium-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Name</span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmitted(false);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Phone</span>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSubmitted(false);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Betriebstyp</span>
            <select
              value={businessType}
              onChange={(event) => handleBusinessTypeChange(event.target.value as BusinessType)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            >
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Anfragetyp</span>
            <select
              value={requestType}
              onChange={(event) => {
                setRequestType(event.target.value);
                setSubmitted(false);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            >
              {availableRequests.map((request) => (
                <option key={request} value={request}>
                  {request}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold text-navy-950">Nachricht</span>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setSubmitted(false);
            }}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Lead simulieren
        </button>
      </form>

      <aside className="premium-card-dark p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Simulierter Ablauf</p>
        {submitted ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-md bg-white p-4 text-navy-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Automatische Antwort</p>
              <p className="mt-2 leading-6">
                Guten Tag, hier ist {businessType === "Garage" ? "Ihre Garage" : "Ihr Betrieb"}. Wir haben Ihre Anfrage
                gesehen. Geht es um {requestType}? Wir melden uns mit den nächsten Schritten.
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Interne Benachrichtigung</p>
              <p className="mt-2 leading-6">Neuer qualifizierter Lead: {summary}</p>
              <p className="mt-3 text-sm text-slate-300">Originalnachricht: {message}</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-slate-300">
            Fuelle das Formular aus und starte die Simulation. Es werden keine Nachrichten versendet.
          </div>
        )}
      </aside>
    </div>
  );
}
