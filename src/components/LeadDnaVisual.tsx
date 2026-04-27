import Link from "next/link";
import type { LeadDnaDimension, LeadDnaProfile } from "@/lib/leadDna";

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

function getDimension(profile: LeadDnaProfile, label: string) {
  return profile.dimensions.find((dimension) => dimension.label === label) || profile.dimensions[0];
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
    { dimension: getDimension(profile, "Wert"), className: "left-1/2 top-0 -translate-x-1/2" },
    { dimension: getDimension(profile, "Dringlichkeit"), className: "right-0 top-[28%]" },
    { dimension: getDimension(profile, "Rückmelde-Druck"), className: "bottom-0 right-[8%]" },
    { dimension: getDimension(profile, "Konkurrenzrisiko"), className: "bottom-0 left-[8%]" },
    { dimension: getDimension(profile, "Abschlusschance"), className: "left-0 top-[28%]" },
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

      <div className={`relative mx-auto mt-6 ${compact ? "h-56 max-w-sm" : "h-72 max-w-xl"}`}>
        <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-200/25 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/15" />

        <div className="metric-glow absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-center shadow-[0_0_50px_rgba(37,165,106,0.28)]">
          <span className="text-3xl font-bold text-white">{profile.priorityScore}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Signal</span>
        </div>

        {nodes.map(({ dimension, className }) => {
          const tone = getLevelTone(dimension.score);

          return (
            <div
              key={dimension.key}
              className={`absolute ${className} w-32 rounded-lg border ${tone.border} ${tone.bg} ${tone.glow} p-3 text-center backdrop-blur`}
            >
              <p className={`text-lg font-bold ${tone.text}`}>{dimension.score}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">{dimension.label}</p>
            </div>
          );
        })}
      </div>
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
        <p className="text-sm font-semibold text-white">{profile.recommendedAction}</p>
        <p className="text-xs text-slate-400">Priorität {profile.priorityScore}/100</p>
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
