import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CsvRouteContext = {
  params: Promise<{ id: string }>;
};

type LeadCsvRow = {
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  request_type: string | null;
  message: string | null;
  status: string | null;
  estimated_value_chf: number | null;
  source: string | null;
  internal_summary: string | null;
};

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: LeadCsvRow[]) {
  const headers = [
    "created_at",
    "customer_name",
    "customer_phone",
    "customer_email",
    "request_type",
    "message",
    "status",
    "estimated_value_chf",
    "source",
    "internal_summary",
  ];

  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => csvCell(row[header as keyof LeadCsvRow]))
        .join(","),
    ),
  ].join("\n");
}

function readDateParam(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function startOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function endOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}

export async function GET(request: Request, context: CsvRouteContext) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const start = readDateParam(url.searchParams.get("start"));
  const end = readDateParam(url.searchParams.get("end"));

  try {
    const supabase = createServiceRoleClient();
    let query = supabase
      .from("client_leads")
      .select(
        "created_at, customer_name, customer_phone, customer_email, request_type, message, status, estimated_value_chf, source, internal_summary",
      )
      .eq("client_id", id);

    if (start) {
      query = query.gte("created_at", startOfDayIso(start));
    }

    if (end) {
      query = query.lte("created_at", endOfDayIso(end));
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Lead CSV export failed:", error);
      return NextResponse.json({ error: "CSV konnte nicht erstellt werden." }, { status: 500 });
    }

    return new NextResponse(toCsv((data || []) as LeadCsvRow[]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leadleak-client-${id}-leads.csv"`,
      },
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
