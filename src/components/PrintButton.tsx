"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
    >
      Drucken
    </button>
  );
}
