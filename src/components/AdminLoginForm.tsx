"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Falsches Passwort.");
        return;
      }

      router.push("/admin/audits");
      router.refresh();
    } catch {
      setError("Login fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-navy-950">Passwort</span>
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</div> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Wird geprüft..." : "Login"}
      </button>
    </form>
  );
}
