create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_push_subscriptions enable row level security;

create or replace function public.admin_push_subscription_upsert(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null
    or auth.role() <> 'authenticated'
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  insert into public.admin_push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (endpoint) do update set
    user_id = excluded.user_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    updated_at = now();
end;
$$;

revoke all on function public.admin_push_subscription_upsert(text, text, text, text) from public;
grant execute on function public.admin_push_subscription_upsert(text, text, text, text) to authenticated;
