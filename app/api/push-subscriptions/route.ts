import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/app/lib/supabase/server";

type SubscriptionPayload = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

export async function POST(request: Request) {
  let payload: SubscriptionPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  if (typeof payload.endpoint !== "string" || typeof payload.keys?.p256dh !== "string" || typeof payload.keys.auth !== "string") {
    return NextResponse.json({ error: "invalid-subscription" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (claims?.claims.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error } = await supabase.rpc("admin_push_subscription_upsert", {
    p_endpoint: payload.endpoint,
    p_p256dh: payload.keys.p256dh,
    p_auth: payload.keys.auth,
    p_user_agent: request.headers.get("user-agent"),
  });

  if (error) {
    console.error("Falha ao salvar assinatura Web Push", { code: error.code });
    return NextResponse.json({ error: "subscription-save-failed", code: error.code ?? "unknown" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
