"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const publicFooterPaths = new Set([
  "/",
  "/demo",
  "/garage",
  "/pricing",
  "/audit",
  "/simulate",
  "/datenschutz",
  "/impressum",
]);

export function PublicFooter() {
  const pathname = usePathname();

  if (!publicFooterPaths.has(pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm leading-6 text-slate-300">
          LeadLeak AI – Pilot-System für strukturierte Anfrage- und Lead-Erfassung.
        </p>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-slate-200">
          <Link href="/datenschutz" className="transition hover:text-white">
            Datenschutz
          </Link>
          <Link href="/impressum" className="transition hover:text-white">
            Impressum
          </Link>
          <Link href="/client/login" className="transition hover:text-white">
            Kundenportal
          </Link>
          <Link href="/audit" className="transition hover:text-white">
            Lead-Audit buchen
          </Link>
        </nav>
      </div>
    </footer>
  );
}
