"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/garage", label: "Garage Demo" },
  { href: "/demo", label: "Dashboard" },
  { href: "/pricing", label: "Preise" },
];

export function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/p/")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/90 text-white shadow-[0_12px_35px_rgba(7,17,31,0.20)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-swiss-green shadow-[0_0_18px_rgba(37,165,106,0.8)]" />
          <span>LeadLeak AI</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-slate-200 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/audit"
          className="premium-button-primary px-4 py-2 text-sm"
        >
          Lead-Audit buchen
        </Link>
      </nav>
    </header>
  );
}
