-- Lista administrativa paginada de lojas. A coluna de volume considera pedidos
-- não cancelados; Pix só entra depois da confirmação do pagamento.
create or replace function public.admin_dashboard_lojas(
  p_ordenacao text default 'top',
  p_pagina integer default 1,
  p_por_pagina integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resultado jsonb;
  v_ordenacao text := case when p_ordenacao = 'new' then 'new' else 'top' end;
  v_pagina integer := greatest(coalesce(p_pagina, 1), 1);
  v_por_pagina integer := least(greatest(coalesce(p_por_pagina, 10), 1), 100);
begin
  if auth.role() <> 'authenticated'
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  with lojas as (
    select
      e.id as empresa_id,
      e.nome_empresa,
      e.slug,
      ec.icone_app_url,
      e.created_at,
      count(pe.id) as pedidos_validos,
      coalesce(sum(pe.total), 0) as volume_vendido
    from public.empresas e
    inner join public.perfis p on p.id = e.proprietario_id and p.role = 'proprietario'
    left join public.empresa_config ec on ec.empresa_id = e.id
    left join public.pedidos pe on pe.empresa_id = e.id
      and pe.status <> 'cancelado'
      and (lower(coalesce(pe.forma_pagamento::text, '')) <> 'pix' or pe.status_pagamento = 'pago')
    group by e.id, e.nome_empresa, e.slug, ec.icone_app_url, e.created_at
  ),
  ordenadas as (
    select *, count(*) over() as total_lojas
    from lojas
    order by
      case when v_ordenacao = 'top' then volume_vendido end desc nulls last,
      case when v_ordenacao = 'top' then pedidos_validos end desc nulls last,
      case when v_ordenacao = 'new' then created_at end desc nulls last,
      nome_empresa asc
    offset (v_pagina - 1) * v_por_pagina
    limit v_por_pagina
  )
  select jsonb_build_object(
    'stores', coalesce(jsonb_agg(jsonb_build_object(
      'empresa_id', empresa_id,
      'nome_empresa', nome_empresa,
      'slug', slug,
      'icone_app_url', icone_app_url,
      'created_at', created_at,
      'pedidos_validos', pedidos_validos,
      'volume_vendido', volume_vendido
    )), '[]'::jsonb),
    'total', coalesce(max(total_lojas), 0),
    'page', v_pagina,
    'perPage', v_por_pagina
  ) into resultado
  from ordenadas;

  return resultado;
end;
$$;

revoke all on function public.admin_dashboard_lojas(text, integer, integer) from public;
grant execute on function public.admin_dashboard_lojas(text, integer, integer) to authenticated;
