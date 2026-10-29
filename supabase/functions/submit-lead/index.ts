import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RECIPIENT = "cleangutters2008@gmail.com";
const SENDER = "CleanGutters Lighting Website <leads@thetradesguy.com>";
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function reply(success: boolean, status: number, extra: Record<string, unknown> = {}) {
  return json({ success, ...extra }, status);
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return reply(false, 405, { error: "method_not_allowed" });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return reply(false, 400, { error: "invalid_request" });

    if (clean(body.company_website, 200)) return reply(false, 400, { error: "invalid_request" });

    const name = clean(body.name, 200);
    const phone = clean(body.phone, 50);
    const digits = phone.replace(/\D/g, "");
    if (!name) return reply(false, 400, { error: "name_required" });
    if (digits.length < 10 || digits.length > 15) return reply(false, 400, { error: "phone_invalid" });

    const service = clean(body.service, 100) || "Free estimate";
    const pageUrl = clean(body.page_url ?? body.pageUrl, 2000);
    const email = clean(body.email, 320);
    const address = clean(body.address, 300);
    const city = clean(body.city, 120);
    const message = clean(body.message, 2000);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
    const { data: recent, error: recentError } = await supabase
      .from("contact_submissions")
      .select("id")
      .eq("phone", phone)
      .eq("name", name)
      .eq("emailed", true)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (recentError) console.error("duplicate check failed", recentError.message);
    if (recent) return reply(true, 200, { duplicate: true });

    const { data: row, error: insertError } = await supabase
      .from("contact_submissions")
      .insert({ name, phone, email, service, message: [message, address && `Address: ${address}`, city && `City: ${city}`].filter(Boolean).join("\n"), page_url: pageUrl, emailed: false })
      .select("id")
      .single();
    if (insertError) console.error("lead insert failed", insertError.message);

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) {
      console.error("RESEND_API_KEY missing");
      return reply(false, 503, { error: "delivery_unavailable" });
    }

    const lines: [string, string][] = [
      ["Name", name],
      ["Phone", phone],
      ["Service", service],
      ...(email ? [["Email", email] as [string, string]] : []),
      ...(address ? [["Address", address] as [string, string]] : []),
      ...(city ? [["City", city] as [string, string]] : []),
      ...(message ? [["Message", message] as [string, string]] : []),
      ["Page", pageUrl || "-"],
      ["Received", new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET"],
    ];
    const text = lines.map(([k, v]) => `${k}: ${v}`).join("\n");
    const html = `<h2 style="font-family:sans-serif">New estimate request</h2><table style="font-family:sans-serif;font-size:15px">${lines
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">${k}</td><td>${escapeHtml(v)}</td></tr>`)
      .join("")}</table>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: SENDER,
        to: [RECIPIENT],
        subject: `New estimate request: ${name} ${phone}`,
        text,
        html,
      }),
    });
    const resendBody = await resendRes.json().catch(() => null);

    if (!resendRes.ok || !resendBody?.id) {
      console.error("email delivery failed", resendRes.status, JSON.stringify(resendBody));
      return reply(false, 502, { error: "delivery_failed" });
    }

    if (row?.id) {
      const { error: updateError } = await supabase.from("contact_submissions").update({ emailed: true }).eq("id", row.id);
      if (updateError) console.error("emailed flag update failed", updateError.message);
    }

    return reply(true, 200);
  } catch (err) {
    console.error("submit-lead error", err instanceof Error ? err.message : String(err));
    return reply(false, 500, { error: "server_error" });
  }
});
