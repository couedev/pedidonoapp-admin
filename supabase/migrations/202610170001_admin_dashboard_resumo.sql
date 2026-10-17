-- Painel administrativo: valores financeiros realizados somente em Pix aprovado.
-- A função é SECURITY DEFINER porque pagamentos_mercado_pago não é exposta a
-- anon/authenticated. A autorização de administrador continua obrigatória.
create or replace function public.admin_dashboard_resumo(
  p_inicio timestamptz,
  p_fim timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
set timezone = 'America/Fortaleza'
as $$
declare
  resultado jsonb;
begin
  if auth.role() <> 'authenticated'
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  if p_inicio is null or p_fim is null or p_inicio >= p_fim then
    raise exception 'Intervalo de datas inválido' using errcode = '22007';
  end if;

  with transacoes_pix as (
    select
      mp.empresa_id,
      mp.pedido_id,
      mp.paid_at,
      mp.amount,
      mp.application_fee,
      mp.net_received_amount
    from public.pagamentos_mercado_pago mp
    inner join public.pedidos pe on pe.id = mp.pedido_id
    where mp.status = 'approved'
      and pe.status_pagamento = 'pago'
      and pe.status <> 'cancelado'
      and mp.live_mode is distinct from false
      and mp.paid_at >= p_inicio
      and mp.paid_at < p_fim
  ),
  metricas as (
    select
      (select count(distinct e.proprietario_id)
       from public.empresas e
       inner join public.perfis p on p.id = e.proprietario_id
       where p.role = 'proprietario') as lojistas,
      count(distinct pedido_id) as pix_aprovados,
      coalesce(sum(amount), 0) as volume_pix_bruto,
      coalesce(sum(application_fee), 0) as receita_taxas,
      coalesce(sum(net_received_amount), 0) as liquido_lojas
    from transacoes_pix
  ),
  serie as (
    select
      to_char(date_trunc('day', paid_at), 'YYYY-MM-DD') as data,
      coalesce(sum(amount), 0) as volume_pix_bruto,
      coalesce(sum(application_fee), 0) as receita_taxas
    from transacoes_pix
    group by 1
  ),
  top_sellers as (
    select
      e.id as empresa_id,
      e.nome_empresa,
      p.nome as proprietario,
      count(distinct tx.pedido_id) as pix_aprovados,
      coalesce(sum(tx.amount), 0) as volume_pix_bruto,
      coalesce(sum(tx.application_fee), 0) as receita_taxas
    from transacoes_pix tx
    inner join public.empresas e on e.id = tx.empresa_id
    inner join public.perfis p on p.id = e.proprietario_id
    where p.role = 'proprietario'
    group by e.id, e.nome_empresa, p.nome
    order by volume_pix_bruto desc, pix_aprovados desc
    limit 4
  )
  select jsonb_build_object(
    'metrics', (select jsonb_build_object(
      'lojistas', lojistas,
      'pix_aprovados', pix_aprovados,
      'volume_pix_bruto', volume_pix_bruto,
      'receita_taxas', receita_taxas,
      'liquido_lojas', liquido_lojas
    ) from metricas),
    'series', (select coalesce(jsonb_agg(jsonb_build_object(
      'data', data,
      'volume_pix_bruto', volume_pix_bruto,
      'receita_taxas', receita_taxas
    ) order by data), '[]'::jsonb) from serie),
    'top_sellers', (select coalesce(jsonb_agg(jsonb_build_object(
      'empresa_id', empresa_id,
      'nome_empresa', nome_empresa,
      'proprietario', proprietario,
      'pix_aprovados', pix_aprovados,
      'volume_pix_bruto', volume_pix_bruto,
      'receita_taxas', receita_taxas
    ) order by volume_pix_bruto desc, pix_aprovados desc), '[]'::jsonb) from top_sellers)
  ) into resultado;

  return resultado;
end;
$$;

revoke all on function public.admin_dashboard_resumo(timestamptz, timestamptz) from public;
grant execute on function public.admin_dashboard_resumo(timestamptz, timestamptz) to authenticated;
