"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ClientLoginForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, accessCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login fehlgeschlagen. Bitte Slug und Zugangscode prüfen.");
        return;
      }

      router.push("/client/dashboard");
      router.refresh();
    } catch {
      setError("Login fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card mt-8 p-6">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-navy-950">Kunden-Slug</span>
        <input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
          required
        />
      </label>
      <label className="mt-5 block space-y-2">
        <span className="text-sm font-semibold text-navy-950">Zugangscode</span>
        <input
          type="password"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Login wird geprüft..." : "Einloggen"}
      </button>
      {error ? <div className="mt-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
    </form>
  );
}
