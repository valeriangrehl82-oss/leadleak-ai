import Link from "next/link";
import type { LeadDnaDimension, LeadDnaDimensionKey, LeadDnaProfile } from "@/lib/leadDna";

type LeadDnaCoreProps = {
  profile: LeadDnaProfile;
  compact?: boolean;
};

type LeadDnaCompactCardProps = {
  profile: LeadDnaProfile;
  title: string;
  subtitle?: string;
  href?: string;
};

function getDimension(profile: LeadDnaProfile, key: LeadDnaDimensionKey) {
  return profile.dimensions.find((dimension) => dimension.key === key) || profile.dimensions[0];
}

function getLevelTone(score: number) {
  if (score >= 70) {
    return {
      text: "text-emerald-200",
      border: "border-emerald-300/35",
      bg: "bg-emerald-400/15",
      fill: "from-emerald-300 to-teal-300",
      glow: "shadow-[0_0_34px_rgba(45,212,191,0.24)]",
    };
  }

  if (score >= 45) {
    return {
      text: "text-cyan-100",
      border: "border-cyan-300/25",
      bg: "bg-cyan-400/10",
      fill: "from-cyan-300 to-emerald-300",
      glow: "shadow-[0_0_24px_rgba(34,211,238,0.16)]",
    };
  }

  return {
    text: "text-slate-200",
    border: "border-white/10",
    bg: "bg-white/5",
    fill: "from-slate-400 to-slate-300",
    glow: "shadow-none",
  };
}

function GenomeBar({ dimension }: { dimension: LeadDnaDimension }) {
  const tone = getLevelTone(dimension.score);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{dimension.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{dimension.explanation}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${tone.text}`}>{dimension.score}</p>
          <p className="text-xs text-slate-400">{dimension.level}</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone.fill}`}
          style={{ width: `${dimension.score}%` }}
        />
      </div>
    </div>
  );
}

export function LeadDnaCore({ profile, compact = false }: LeadDnaCoreProps) {
  const nodes = [
    { dimension: getDimension(profile, "value"), className: "sm:col-start-2 sm:row-start-1" },
    { dimension: getDimension(profile, "closeProbability"), className: "sm:col-start-1 sm:row-start-2" },
    { dimension: getDimension(profile, "urgency"), className: "sm:col-start-3 sm:row-start-2" },
    { dimension: getDimension(profile, "competitionRisk"), className: "sm:col-start-1 sm:row-start-3" },
    { dimension: getDimension(profile, "responsePressure"), className: "sm:col-start-3 sm:row-start-3" },
  ];
  const compactNodes = [
    getDimension(profile, "value"),
    getDimension(profile, "urgency"),
    getDimension(profile, "responsePressure"),
    getDimension(profile, "competitionRisk"),
    getDimension(profile, "closeProbability"),
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-950 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(37,165,106,0.22),transparent_38%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lead DNA</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">Chancenprofil</h3>
        </div>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          Business Plus
        </span>
      </div>

      {compact ? (
        <div className="relative mx-auto mt-6 grid w-full max-w-md gap-3">
          <div className="metric-glow mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-center shadow-[0_0_50px_rgba(37,165,106,0.28)]">
            <span className="text-2xl font-bold text-white">{profile.priorityScore}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Einschätzung</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {compactNodes.map((dimension) => {
              const tone = getLevelTone(dimension.score);

              return (
                <div
                  key={dimension.key}
                  className={`min-h-20 rounded-lg border ${tone.border} ${tone.bg} ${tone.glow} p-3 text-center backdrop-blur`}
                >
                  <p className={`text-lg font-bold ${tone.text}`}>{dimension.score}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    {dimension.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto mt-6 w-full max-w-2xl">
          <div className="pointer-events-none absolute inset-x-[15%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-emerald-200/25 to-transparent sm:block" />
          <div className="pointer-events-none absolute bottom-[18%] left-1/2 top-[18%] hidden w-px bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent sm:block" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/15 sm:block" />

          <div className="relative grid gap-3 sm:grid-cols-3 sm:grid-rows-3 sm:items-center">
            {nodes.map(({ dimension, className }) => {
              const tone = getLevelTone(dimension.score);

              return (
                <div
                  key={dimension.key}
                  className={`${className} min-h-20 rounded-lg border ${tone.border} ${tone.bg} ${tone.glow} p-3 text-center backdrop-blur`}
                >
                  <p className={`text-lg font-bold ${tone.text}`}>{dimension.score}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300 sm:text-[11px]">
                    {dimension.label}
                  </p>
                </div>
              );
            })}
            <div className="metric-glow order-first mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-center shadow-[0_0_50px_rgba(37,165,106,0.28)] sm:order-none sm:col-start-2 sm:row-start-2">
              <span className="text-3xl font-bold text-white">{profile.priorityScore}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Einschätzung</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeadDnaPrivacyNote({ publicShort = false }: { publicShort?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-slate-300">
      <p className="font-semibold text-slate-200">
        Lead DNA ist eine interne Priorisierungshilfe für Rückmeldungen und keine automatisierte Entscheidung über
        Kundinnen oder Kunden.
      </p>
      <p className="mt-2">
        Die Einschätzung basiert auf Anfrageinhalt, Status, Alter der Anfrage und geschätztem Auftragswert. Sie dient
        ausschliesslich der Organisation des Rückmeldeprozesses.
      </p>
      {publicShort ? (
        <p className="mt-2 text-emerald-200">Nur als interne Priorisierungshilfe, keine automatisierte Entscheidung.</p>
      ) : null}
    </div>
  );
}

export function LeadDnaBars({ profile }: { profile: LeadDnaProfile }) {
  return (
    <div className="grid gap-3">
      {profile.dimensions.map((dimension) => (
        <GenomeBar key={dimension.key} dimension={dimension} />
      ))}
    </div>
  );
}

export function LeadDnaCompactCard({ profile, title, subtitle, href }: LeadDnaCompactCardProps) {
  const topSignals = [...profile.dimensions].sort((left, right) => right.score - left.score).slice(0, 3);
  const content = (
    <article className="card-hover h-full rounded-xl border border-white/10 bg-navy-950 p-5 text-white shadow-[0_18px_55px_rgba(7,17,31,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lead DNA</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm leading-5 text-slate-400">{subtitle}</p> : null}
        </div>
        <span className="shrink-0 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          {profile.highlightBadge}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {topSignals.map((dimension) => {
          const tone = getLevelTone(dimension.score);

          return (
            <div key={dimension.key} className="grid grid-cols-[8rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="font-semibold text-slate-200">{dimension.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white/10">
                <span
                  className={`block h-full rounded-full bg-gradient-to-r ${tone.fill}`}
                  style={{ width: `${dimension.score}%` }}
                />
              </span>
              <span className={`text-right font-bold ${tone.text}`}>{dimension.score}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-white">Vorschlag: {profile.recommendedAction}</p>
        <p className="text-xs text-slate-400">Einschätzung {profile.priorityScore}/100</p>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
