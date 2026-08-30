import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/admin-auth";
import { PayloadTooLargeError, readJsonObject, UnsupportedContentTypeError } from "@/lib/request-body";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 20_000;
const TRUSTED_PROXY_HEADERS = new Set(["x-forwarded-for", "x-real-ip", "cf-connecting-ip"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value && value >= new Date().toISOString().slice(0, 10);
}

function clientIdentifier(request: NextRequest) {
  const configuredHeader = process.env.TRUSTED_PROXY_IP_HEADER?.toLowerCase();
  const header = process.env.VERCEL
    ? "x-vercel-forwarded-for"
    : configuredHeader && TRUSTED_PROXY_HEADERS.has(configuredHeader)
      ? configuredHeader
      : null;
  return header ? request.headers.get(header)?.split(",")[0]?.trim() || "unknown" : "unknown";
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Agenda ainda não configurada." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
    if (error instanceof UnsupportedContentTypeError) return NextResponse.json({ error: "Envie os dados como JSON." }, { status: 415 });
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const booking = {
    client_name: clean(body.clientName, 100),
    company: clean(body.company, 120),
    email: clean(body.email, 160).toLowerCase(),
    phone: clean(body.phone, 30),
    service_type: clean(body.serviceType, 100),
    desired_date: clean(body.desiredDate, 10),
    alternate_date: clean(body.alternateDate, 10),
    city: clean(body.city, 120),
    venue: clean(body.venue, 180),
    duration_hours: clean(body.durationHours, 10),
    notes: clean(body.notes, 2500)
  };

  const duration = booking.duration_hours ? Number(booking.duration_hours) : null;
  if (
    booking.client_name.length < 2 || !validEmail(booking.email) || booking.phone.length < 8 ||
    !booking.service_type || !validDate(booking.desired_date) ||
    (booking.alternate_date && !validDate(booking.alternate_date)) || !booking.city ||
    booking.notes.length < 10 || (duration !== null && (!Number.isFinite(duration) || duration <= 0 || duration > 168))
  ) {
    return NextResponse.json({ error: "Revise os campos obrigatórios e as datas." }, { status: 422 });
  }

  const identifier = createHash("sha256")
    .update(`booking:${clientIdentifier(request)}:${process.env.CONTACT_RATE_LIMIT_SALT || serviceKey}`)
    .digest("hex");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.rpc("submit_booking_request", { p_identifier: identifier, p_booking: booking });
  if (error) {
    if (error.code === "P0001" && error.message.includes("rate_limited")) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
    }
    console.error("Booking persistence failed", { code: error.code });
    return NextResponse.json({ error: "Não foi possível registrar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
