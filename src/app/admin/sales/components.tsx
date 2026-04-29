import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";

export function SalesShell({
  eyebrow = "Intern",
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/sales" className="text-sm font-semibold text-emerald-200 hover:text-white">
            Zurück zum Sales Command Center
          </Link>
          <p className="premium-eyebrow-dark mt-6">{eyebrow}</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">{title}</h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">{subtitle}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</section>
    </main>
  );
}

export function SalesCard({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`premium-card p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-navy-950">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export function ScriptBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-swiss-mint p-4">
      <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-emerald-950">{text}</p>
      <CopyButton
        text={text}
        label="Text kopieren"
        copiedLabel="Kopiert"
        className="mt-4 rounded-md bg-swiss-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
      />
    </div>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-swiss-green" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function InternalLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="card-hover premium-card p-5">
      <p className="text-lg font-semibold text-navy-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-semibold text-swiss-green">Öffnen</p>
    </Link>
  );
}
