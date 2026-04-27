"use client";

import { FormEvent, useState } from "react";

type PublicClientLeadFormProps = {
  clientName: string;
  slug: string;
  recoveryMessage: string | null;
};

type SubmittedLead = {
  customerName: string;
  customerPhone: string;
  requestType: string;
  message: string;
};

const quickRequestTypes = ["Rückruf", "Service", "Reifenwechsel", "MFK", "Bremsen", "Batterie", "Offerte", "Andere Anfrage"];
const publicSubmitError = "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.";

export function PublicClientLeadForm({ clientName, slug, recoveryMessage }: PublicClientLeadFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [requestType, setRequestType] = useState("");
  const [message, setMessage] = useState("");
  const [submittedLead, setSubmittedLead] = useState<SubmittedLead | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setRequestType("");
    setMessage("");
    setError("");
    setSubmittedLead(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const submittedSnapshot = {
      customerName,
      customerPhone,
      requestType,
      message,
    };

    try {
      const response = await fetch("/api/client-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName,
          customerPhone,
          customerEmail,
          requestType,
          message,
        }),
      });

      if (!response.ok) {
        setError(publicSubmitError);
        return;
      }

      setSubmittedLead(submittedSnapshot);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setRequestType("");
      setMessage("");
    } catch {
      setError(publicSubmitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedLead) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-[0_18px_55px_rgba(7,17,31,0.08)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-swiss-mint text-xl font-bold text-emerald-900 shadow-[0_10px_28px_rgba(37,165,106,0.16)]">
            ✓
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-swiss-green">Übermittlung bestätigt</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">
              Anfrage erfolgreich übermittelt
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Ihre Anfrage wurde an {clientName} übermittelt. Der Betrieb prüft Ihr Anliegen und meldet sich zeitnah.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Der Betrieb erhält Ihre Anfrage strukturiert und kann sich gezielt bei Ihnen melden.
            </p>
          </div>
        </div>

        <dl className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-sm">
          {[
            ["Name", submittedLead.customerName],
            ["Telefon", submittedLead.customerPhone],
            ["Anfrageart", submittedLead.requestType],
            ["Nachricht", submittedLead.message || "-"],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="whitespace-pre-wrap font-semibold text-navy-950">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={resetForm}
          className="ui-lift mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Weitere Anfrage erfassen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(7,17,31,0.08)]">
      {recoveryMessage ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-swiss-mint p-4 text-sm leading-6 text-slate-700">
          {recoveryMessage}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Name</span>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition hover:border-slate-400 focus:border-swiss-green focus:ring-2"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Telefon</span>
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition hover:border-slate-400 focus:border-swiss-green focus:ring-2"
            required
          />
          <span className="block text-xs leading-5 text-slate-500">Damit der Betrieb Sie erreichen kann.</span>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">E-Mail optional</span>
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition hover:border-slate-400 focus:border-swiss-green focus:ring-2"
          />
        </label>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Anfrageart</span>
          <div className="flex flex-wrap gap-2.5">
            {quickRequestTypes.map((item) => {
              const isSelected = requestType === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRequestType(item)}
                  className={`ui-lift min-h-9 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "border-swiss-green bg-swiss-green text-white shadow-[0_10px_28px_rgba(37,165,106,0.20)]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-swiss-green hover:bg-swiss-mint"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <input
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            placeholder="z.B. Reifenwechsel, Service, Rückruf"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition hover:border-slate-400 focus:border-swiss-green focus:ring-2"
            required
          />
        </div>
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-sm font-semibold text-navy-950">Nachricht</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="Beschreiben Sie kurz Ihr Anliegen."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition hover:border-slate-400 focus:border-swiss-green focus:ring-2"
        />
      </label>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Wir verwenden Ihre Angaben zur Bearbeitung dieser Anfrage und zur Benachrichtigung des Betriebs. Weitere
        Informationen finden Sie in der Datenschutzerklärung.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="ui-lift mt-6 w-full rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
      >
        {isSubmitting ? "Wird übermittelt..." : `Anfrage an ${clientName} senden`}
      </button>

      {error ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {publicSubmitError}
        </div>
      ) : null}
    </form>
  );
}
