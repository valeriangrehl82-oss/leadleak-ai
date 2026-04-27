"use client";

import { FormEvent, useState } from "react";

type PublicClientLeadFormProps = {
  clientName: string;
  slug: string;
  recoveryMessage: string | null;
};

export function PublicClientLeadForm({ clientName, slug, recoveryMessage }: PublicClientLeadFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [requestType, setRequestType] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    setError("");
    setIsSubmitting(true);

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Anfrage konnte nicht gespeichert werden.");
        return;
      }

      setSuccess(data.message || "Ihre Anfrage wurde gespeichert. Der Betrieb meldet sich zeitnah.");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setRequestType("");
      setMessage("");
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
      {recoveryMessage ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-swiss-mint p-4 text-sm leading-6 text-slate-700">
          {recoveryMessage}
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Name</span>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Telefon</span>
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">E-Mail optional</span>
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-navy-950">Anfrageart</span>
          <input
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            placeholder="z.B. Reifenwechsel, Service, Rückruf"
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            required
          />
        </label>
      </div>
      <label className="mt-5 block space-y-2">
        <span className="text-sm font-semibold text-navy-950">Nachricht</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Wird gespeichert..." : `Anfrage an ${clientName} senden`}
      </button>
      {success ? <div className="mt-5 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">{success}</div> : null}
      {error ? <div className="mt-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
    </form>
  );
}
