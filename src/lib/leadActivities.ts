import type { SupabaseClient } from "@supabase/supabase-js";
import { getLeadStatusLabel } from "@/lib/leadStatus";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type LeadActivityActorType = "system" | "admin" | "client";

export type LeadActivityRow = {
  id: string;
  created_at: string;
  lead_id: string;
  client_id: string;
  actor_type: LeadActivityActorType;
  actor_label: string | null;
  activity_type: string;
  old_value: string | null;
  new_value: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
};

type LeadActivityClient = SupabaseClient;

type CreateLeadActivityInput = {
  supabase?: LeadActivityClient;
  leadId: string;
  clientId: string;
  actorType?: LeadActivityActorType;
  actorLabel?: string | null;
  activityType: string;
  oldValue?: string | null;
  newValue?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
};

type StatusChangeInput = {
  supabase?: LeadActivityClient;
  leadId: string;
  clientId: string;
  oldStatus: string | null | undefined;
  newStatus: string;
  actorType: LeadActivityActorType;
  actorLabel?: string | null;
};

type FieldUpdateInput = {
  supabase?: LeadActivityClient;
  leadId: string;
  clientId: string;
  oldValue: string | null | undefined;
  newValue: string | null | undefined;
  actorType: LeadActivityActorType;
  actorLabel?: string | null;
};

function getClient(supabase?: LeadActivityClient) {
  return supabase || createServiceRoleClient();
}

function normalizeValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

export async function createLeadActivity(input: CreateLeadActivityInput) {
  try {
    const supabase = getClient(input.supabase);
    const { error } = await supabase.from("lead_activities").insert({
      lead_id: input.leadId,
      client_id: input.clientId,
      actor_type: input.actorType || "system",
      actor_label: input.actorLabel || null,
      activity_type: input.activityType,
      old_value: input.oldValue ?? null,
      new_value: input.newValue ?? null,
      message: input.message ?? null,
      metadata: input.metadata ?? null,
    });

    if (error) {
      console.error("Lead activity insert failed:", error);
    }
  } catch (error) {
    console.error("Lead activity insert failed:", error);
  }
}

export async function getLeadActivitiesForLead(
  leadId: string,
  clientId?: string,
  supabaseClient?: LeadActivityClient,
) {
  try {
    const supabase = getClient(supabaseClient);
    let query = supabase
      .from("lead_activities")
      .select(
        "id, created_at, lead_id, client_id, actor_type, actor_label, activity_type, old_value, new_value, message, metadata",
      )
      .eq("lead_id", leadId);

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Lead activities load failed:", error);
      return [] as LeadActivityRow[];
    }

    return (data || []) as LeadActivityRow[];
  } catch (error) {
    console.error("Lead activities load failed:", error);
    return [] as LeadActivityRow[];
  }
}

export async function logStatusChange(input: StatusChangeInput) {
  const oldStatus = input.oldStatus || "new";

  if (oldStatus === input.newStatus) {
    return;
  }

  const oldLabel = getLeadStatusLabel(oldStatus);
  const newLabel = getLeadStatusLabel(input.newStatus);

  await createLeadActivity({
    supabase: input.supabase,
    leadId: input.leadId,
    clientId: input.clientId,
    actorType: input.actorType,
    actorLabel: input.actorLabel,
    activityType: "status_changed",
    oldValue: oldLabel,
    newValue: newLabel,
    message: `Status geändert: ${oldLabel} -> ${newLabel}`,
  });
}

export async function logClientNoteUpdate(input: FieldUpdateInput) {
  const oldValue = normalizeValue(input.oldValue);
  const newValue = normalizeValue(input.newValue);

  if (oldValue === newValue) {
    return;
  }

  await createLeadActivity({
    supabase: input.supabase,
    leadId: input.leadId,
    clientId: input.clientId,
    actorType: input.actorType,
    actorLabel: input.actorLabel,
    activityType: "note_updated",
    oldValue,
    newValue,
    message: "Interne Notiz aktualisiert",
  });
}

export async function logNextActionUpdate(input: FieldUpdateInput) {
  const oldValue = normalizeValue(input.oldValue);
  const newValue = normalizeValue(input.newValue);

  if (oldValue === newValue) {
    return;
  }

  await createLeadActivity({
    supabase: input.supabase,
    leadId: input.leadId,
    clientId: input.clientId,
    actorType: input.actorType,
    actorLabel: input.actorLabel,
    activityType: "next_action_updated",
    oldValue,
    newValue,
    message: "Nächste Aktion aktualisiert",
  });
}

export async function logFollowUpUpdate(input: FieldUpdateInput) {
  const oldValue = normalizeValue(input.oldValue);
  const newValue = normalizeValue(input.newValue);

  if (oldValue === newValue) {
    return;
  }

  await createLeadActivity({
    supabase: input.supabase,
    leadId: input.leadId,
    clientId: input.clientId,
    actorType: input.actorType,
    actorLabel: input.actorLabel,
    activityType: "follow_up_updated",
    oldValue,
    newValue,
    message: newValue ? "Follow-up Datum gesetzt" : "Follow-up Datum entfernt",
  });
}
