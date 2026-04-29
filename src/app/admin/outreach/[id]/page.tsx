import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { formatChf } from "@/lib/audit";
import { requireAdminPage } from "@/lib/adminGuard";
import {
  buildSlugFromCompany,
  clampFitScore,
  formatDateTime,
  getOutreachPriorityLabel,
  getOutreachStatusLabel,
  isOutreachPriority,
  isOutreachStatus,
  normalizeWebsiteUrl,
  nullableDateTime,
  nullableNumber,
  nullableText,
  outreachPriorities,
  outreachStatuses,
  priorityBadgeClass,
  statusBadgeClass,
  toDateTimeLocalValue,
  type OutreachTargetRow,
} from "@/lib/outreach";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OutreachDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
};

async function loadTarget(id: string) {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("outreach_targets")
      .select(
        "id, created_at, updated_at, company_name, industry, location, website, phone, email, contact_person, source, status, priority, fit_score, estimated_potential_chf, notes, last_contact_at, next_follow_up_at, next_action, demo_scheduled_at, pilot_value_chf, linked_client_id",
      )
      .eq("id", id)
      .maybeSingle<OutreachTargetRow>();

    if (error || !data) {
      return { target: null, error: "Zielbetrieb wurde nicht gefunden." };
    }

    return { target: data, error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { target: null, error: error.message };
    }

    return { target: null, error: "Supabase ist noch nicht konfiguriert oder die Tabelle fehlt." };
  }
}

async function updateTargetAction(formData: FormData) {
  "use server";

  await requireAdminPage();

  const targetId = nullableText(formData.get("target_id"));
  const status = String(formData.get("status") || "new");
  const priority = String(formData.get("priority") || "medium");

  if (!targetId || !isOutreachStatus(status) || !isOutreachPriority(priority)) {
    redirect(`/admin/outreach/${targetId || ""}?error=update`);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("outreach_targets")
    .update({
      status,
      priority,
      fit_score: clampFitScore(Number(formData.get("fit_score") || 50)),
      estimated_potential_chf: nullableNumber(formData.get("estimated_potential_chf")),
      contact_person: nullableText(formData.get("contact_person")),
      phone: nullableText(formData.get("phone")),
      email: nullableText(formData.get("email")),
      website: nullableText(formData.get("website")),
      notes: nullableText(formData.get("notes")),
      next_action: nullableText(formData.get("next_action")),
      last_contact_at: nullableDateTime(formData.get("last_contact_at")),
      next_follow_up_at: nullableDateTime(formData.get("next_follow_up_at")),
      demo_scheduled_at: nullableDateTime(formData.get("demo_scheduled_at")),
      pilot_value_chf: nullableNumber(formData.get("pilot_value_chf")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);

  if (error) {
    console.error("Outreach target update failed:", error);
    redirect(`/admin/outreach/${targetId}?error=update`);
  }

  redirect(`/admin/outreach/${targetId}?updated=1`);
}

async function convertToClientAction(formData: FormData) {
  "use server";

  await requireAdminPage();

  const targetId = nullableText(formData.get("target_id"));
  const slug = nullableText(formData.get("slug"))?.toLowerCase();

  if (!targetId || !slug) {
    redirect(`/admin/outreach/${targetId || ""}?error=convert`);
  }

  const supabase = createServiceRoleClient();
  const { data: target, error: targetError } = await supabase
    .from("outreach_targets")
    .select(
      "id, company_name, industry, contact_person, email, phone, linked_client_id",
    )
    .eq("id", targetId)
    .maybeSingle<Pick<OutreachTargetRow, "id" | "company_name" | "industry" | "contact_person" | "email" | "phone" | "linked_client_id">>();

  if (targetError || !target) {
    redirect(`/admin/outreach/${targetId}?error=convert`);
  }

  if (target.linked_client_id) {
    redirect(`/admin/clients/${target.linked_client_id}`);
  }

  if (!target.email) {
    redirect(`/admin/outreach/${targetId}?error=convert-email`);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: target.company_name,
      slug,
      industry: target.industry || "Servicebetrieb",
      contact_person: target.contact_person || null,
      notification_email: target.email,
      phone: target.phone || null,
      average_order_value_chf: 250,
      is_active: true,
    })
    .select("id")
    .single<{ id: string }>();

  if (clientError || !client) {
    console.error("Outreach convert to client failed:", clientError);
    redirect(`/admin/outreach/${targetId}?error=convert`);
  }

  const { error: updateError } = await supabase
    .from("outreach_targets")
    .update({ linked_client_id: client.id, updated_at: new Date().toISOString() })
    .eq("id", targetId);

  if (updateError) {
    console.error("Outreach link client failed:", updateError);
  }

  redirect(`/admin/clients/${client.id}`);
}

export default async function OutreachDetailPage({ params, searchParams }: OutreachDetailPageProps) {
  const { id } = await params;
  const urlParams = await searchParams;
  const { target, error } = await loadTarget(id);

  if (!target) {
    return (
      <main className="premium-page">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/outreach" className="text-sm font-semibold text-swiss-green">
            Zurück zur Outreach Pipeline
          </Link>
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        </section>
      </main>
    );
  }

  const websiteUrl = normalizeWebsiteUrl(target.website);
  const estimatedPotential = target.estimated_potential_chf ? formatChf(target.estimated_potential_chf) : "-";
  const pilotValue = target.pilot_value_chf ? formatChf(target.pilot_value_chf) : "-";
  const callPrepText =
    "Grüezi, ich mache es kurz: Wie handhaben Sie aktuell verpasste Anrufe oder Rückrufwünsche, wenn gerade niemand Zeit hat?";
  const demoBridge = "Ich kann Ihnen in 7 Minuten zeigen, wie LeadLeak solche Anfragen sichtbar macht.";

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/outreach" className="text-sm font-semibold text-emerald-200 hover:text-white">
            Zurück zur Outreach Pipeline
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="premium-eyebrow-dark">Zielbetrieb</p>
              <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">{target.company_name}</h1>
              <p className="premium-muted-dark mt-4">
                {[target.industry, target.location].filter(Boolean).join(" · ") || "Branche / Ort offen"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusBadgeClass(target.status)}`}>
                {getOutreachStatusLabel(target.status)}
              </span>
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${priorityBadgeClass(target.priority)}`}>
                Priorität: {getOutreachPriorityLabel(target.priority)}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <HeaderMetric label="Fit Score" value={`${target.fit_score ?? 50}/100`} />
            <HeaderMetric label="Potenzial" value={estimatedPotential} />
            <HeaderMetric label="Pilotwert" value={pilotValue} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {urlParams.updated ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Zielbetrieb wurde aktualisiert.
          </div>
        ) : null}
        {urlParams.error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            {urlParams.error === "convert-email"
              ? "Für die Umwandlung zum Pilotkunden braucht der Zielbetrieb eine E-Mail-Adresse."
              : "Aktion konnte nicht gespeichert werden. Bitte Angaben prüfen."}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5 content-start">
            <InfoCard
              title="Company Overview"
              items={[
                ["Branche", target.industry || "-"],
                ["Ort / Region", target.location || "-"],
                ["Website", target.website || "-"],
                ["Telefon", target.phone || "-"],
                ["E-Mail", target.email || "-"],
                ["Kontaktperson", target.contact_person || "-"],
                ["Quelle", target.source || "-"],
              ]}
              websiteUrl={websiteUrl}
              phone={target.phone}
            />

            <InfoCard
              title="Sales Status"
              items={[
                ["Status", getOutreachStatusLabel(target.status)],
                ["Priorität", getOutreachPriorityLabel(target.priority)],
                ["Fit Score", `${target.fit_score ?? 50}/100`],
                ["Geschätztes Potenzial", estimatedPotential],
                ["Letzter Kontakt", formatDateTime(target.last_contact_at)],
                ["Nächstes Follow-up", formatDateTime(target.next_follow_up_at)],
                ["Demo geplant", formatDateTime(target.demo_scheduled_at)],
                ["Pilotwert", pilotValue],
              ]}
            />

            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Notes & Next Action</h2>
              <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-700">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notizen</p>
                  <p className="mt-2 whitespace-pre-wrap">{target.notes || "-"}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-swiss-mint p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Nächste Aktion</p>
                  <p className="mt-2 whitespace-pre-wrap text-emerald-950">{target.next_action || "-"}</p>
                </div>
              </div>
            </section>

            <section className="premium-card-dark p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Call Prep</p>
              <h2 className="mt-3 text-2xl font-semibold">Gespräch vorbereiten</h2>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Suggested opening</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">{callPrepText}</p>
                <CopyButton
                  text={callPrepText}
                  label="Opening kopieren"
                  copiedLabel="Kopiert"
                  className="mt-4 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                />
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Problemfragen</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  {[
                    "Passiert es manchmal, dass Rückrufe im Tagesgeschäft untergehen?",
                    "Wie dokumentieren Sie offene Anfragen?",
                    "Wie sehen Sie später, welche Anfrage noch offen ist?",
                  ].map((question) => (
                    <li key={question}>• {question}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Demo Bridge</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">{demoBridge}</p>
                <CopyButton
                  text={demoBridge}
                  label="Bridge kopieren"
                  copiedLabel="Kopiert"
                  className="mt-4 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                />
              </div>
            </section>
          </div>

          <div className="grid gap-5 content-start">
            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Update Form</h2>
              <form action={updateTargetAction} className="mt-5 grid gap-5">
                <input type="hidden" name="target_id" value={target.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select name="status" label="Status" defaultValue={target.status || "new"} options={outreachStatuses} />
                  <Select
                    name="priority"
                    label="Priorität"
                    defaultValue={target.priority || "medium"}
                    options={outreachPriorities}
                  />
                  <Input name="fit_score" label="Fit Score" type="number" defaultValue={String(target.fit_score ?? 50)} />
                  <Input
                    name="estimated_potential_chf"
                    label="Geschätztes Potenzial CHF"
                    type="number"
                    defaultValue={target.estimated_potential_chf ? String(target.estimated_potential_chf) : ""}
                  />
                  <Input name="contact_person" label="Kontaktperson" defaultValue={target.contact_person || ""} />
                  <Input name="phone" label="Telefon" defaultValue={target.phone || ""} />
                  <Input name="email" label="E-Mail" type="email" defaultValue={target.email || ""} />
                  <Input name="website" label="Website" defaultValue={target.website || ""} />
                  <Input
                    name="last_contact_at"
                    label="Letzter Kontakt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalValue(target.last_contact_at)}
                  />
                  <Input
                    name="next_follow_up_at"
                    label="Nächstes Follow-up"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalValue(target.next_follow_up_at)}
                  />
                  <Input
                    name="demo_scheduled_at"
                    label="Demo geplant"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalValue(target.demo_scheduled_at)}
                  />
                  <Input
                    name="pilot_value_chf"
                    label="Pilotwert CHF"
                    type="number"
                    defaultValue={target.pilot_value_chf ? String(target.pilot_value_chf) : ""}
                  />
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-navy-950">Notizen</span>
                  <textarea name="notes" rows={5} defaultValue={target.notes || ""} className="premium-input" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-navy-950">Nächste Aktion</span>
                  <textarea name="next_action" rows={4} defaultValue={target.next_action || ""} className="premium-input" />
                </label>
                <button type="submit" className="premium-button-primary px-5 py-3 text-sm">
                  Änderungen speichern
                </button>
              </form>
            </section>

            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Als Pilotkunde anlegen</h2>
              {target.linked_client_id ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-swiss-mint p-4 text-sm leading-7 text-emerald-950">
                  Dieser Zielbetrieb ist bereits mit einem Pilotkunden verknüpft.
                  <div className="mt-4">
                    <Link href={`/admin/clients/${target.linked_client_id}`} className="premium-button-primary px-4 py-2 text-sm">
                      Kunden öffnen
                    </Link>
                  </div>
                </div>
              ) : (
                <form action={convertToClientAction} className="mt-4 grid gap-4">
                  <input type="hidden" name="target_id" value={target.id} />
                  <Input name="slug" label="Kunden-Slug" defaultValue={buildSlugFromCompany(target.company_name)} required />
                  <p className="text-sm leading-6 text-slate-600">
                    Für die Umwandlung wird eine E-Mail-Adresse als Benachrichtigungsadresse benötigt. Der Slug muss
                    eindeutig sein.
                  </p>
                  <button type="submit" className="premium-button-primary px-5 py-3 text-sm">
                    Als Pilotkunde anlegen
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-glass rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function InfoCard({
  title,
  items,
  websiteUrl,
  phone,
}: {
  title: string;
  items: [string, string][];
  websiteUrl?: string;
  phone?: string | null;
}) {
  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-semibold text-navy-950">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {phone ? (
            <a href={`tel:${phone}`} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-navy-950">
              Anrufen
            </a>
          ) : null}
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-navy-950"
            >
              Website öffnen
            </a>
          ) : null}
        </div>
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap font-semibold leading-6 text-navy-950">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Input({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} className="premium-input" />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <select name={name} defaultValue={defaultValue} className="premium-input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
