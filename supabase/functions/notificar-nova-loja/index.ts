import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";
import webpush from "npm:web-push@3.6.7";

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: { id?: string; nome_empresa?: string; slug?: string };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("NEW_STORE_WEBHOOK_SECRET");
const vapidSubject = Deno.env.get("VAPID_SUBJECT");
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!webhookSecret || request.headers.get("authorization") !== `Bearer ${webhookSecret}`) return new Response("Unauthorized", { status: 401 });
  if (!supabaseUrl || !serviceRoleKey || !vapidSubject || !vapidPublicKey || !vapidPrivateKey) return new Response("Missing server configuration", { status: 500 });

  const event = (await request.json()) as WebhookPayload;
  if (event.type !== "INSERT" || event.table !== "empresas") return Response.json({ ignored: true });

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: subscriptions, error } = await supabase.from("admin_push_subscriptions").select("id, endpoint, p256dh, auth");
  if (error) return new Response("Unable to load subscriptions", { status: 500 });

  const name = event.record?.nome_empresa || "Nova loja";
  const slug = event.record?.slug;
  const notification = JSON.stringify({
    title: "Nova loja cadastrada",
    body: `${name}${slug ? ` · /${slug}` : ""}`,
    url: "/dashboard?section=lojas&storeOrder=new&storePage=1",
  });

  const results = await Promise.allSettled((subscriptions ?? []).map((subscription) =>
    webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      notification,
    ),
  ));

  const expiredIds = results.flatMap((result, index) => {
    if (result.status !== "rejected") return [];
    const statusCode = (result.reason as { statusCode?: number }).statusCode;
    return statusCode === 404 || statusCode === 410 ? [subscriptions?.[index].id] : [];
  }).filter((id): id is string => Boolean(id));

  if (expiredIds.length) await supabase.from("admin_push_subscriptions").delete().in("id", expiredIds);

  return Response.json({ sent: results.filter((result) => result.status === "fulfilled").length });
});
