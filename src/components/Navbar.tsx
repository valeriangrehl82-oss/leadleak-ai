import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/garage", label: "Garage Demo" },
  { href: "/demo", label: "Dashboard" },
  { href: "/pricing", label: "Preise" },
];

const salesItems = [
  { href: "/call-checklist", label: "Call-Checkliste" },
  { href: "/sales-script", label: "Sales Script" },
  { href: "/pilot-offer", label: "Pilot-Angebot" },
  { href: "/objections", label: "Einwände" },
  { href: "/simulate", label: "Simulation" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white shadow-[0_12px_35px_rgba(7,17,31,0.20)] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          LeadLeak AI
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-slate-200 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="cursor-pointer list-none transition hover:text-white">
              Sales
              <span className="ml-1 text-xs text-slate-400">▾</span>
            </summary>
            <div className="absolute right-0 mt-3 w-48 rounded-md border border-white/10 bg-navy-900 p-2 shadow-soft">
              {salesItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
        <Link
          href="/audit"
          className="rounded-md bg-swiss-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Lead-Audit buchen
        </Link>
      </nav>
    </header>
  );
}
