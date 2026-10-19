import "server-only";

import { getSupabaseServerClient } from "@/app/lib/supabase/server";

export type DashboardPeriod = "today" | "week" | "month" | "year" | "custom";
export type StoreOrder = "top" | "new";

export type DashboardData = {
  metrics: {
    lojistas: number;
    pix_aprovados: number;
    volume_pix_bruto: number;
    receita_taxas: number;
    liquido_lojas: number;
  };
  series: Array<{
    data: string;
    volume_pix_bruto: number;
    receita_taxas: number;
  }>;
  top_sellers: Array<{
    empresa_id: string;
    nome_empresa: string;
    proprietario: string | null;
    pix_aprovados: number;
    volume_pix_bruto: number;
    receita_taxas: number;
  }>;
};

export type DashboardRange = {
  period: DashboardPeriod;
  start: string;
  end: string;
  label: string;
};

export type DashboardStores = {
  stores: Array<{
    empresa_id: string;
    nome_empresa: string;
    slug: string;
    whatsapp: string | null;
    icone_app_url: string | null;
    created_at: string;
    pedidos_validos: number;
    volume_vendido: number;
    receita_taxas: number;
  }>;
  total: number;
  page: number;
  perPage: number;
  order: StoreOrder;
};

const EMPTY_DASHBOARD: DashboardData = {
  metrics: {
    lojistas: 0,
    pix_aprovados: 0,
    volume_pix_bruto: 0,
    receita_taxas: 0,
    liquido_lojas: 0,
  },
  series: [],
  top_sellers: [],
};

const EMPTY_STORES: DashboardStores = {
  stores: [],
  total: 0,
  page: 1,
  perPage: 10,
  order: "top",
};

function brazilToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function startOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function startOfYear(date: string) {
  return `${date.slice(0, 4)}-01-01`;
}

function startOfWeek(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
}

function isDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function getDashboardRange(searchParams: Record<string, string | string[] | undefined>): DashboardRange {
  const requested = searchParams.period;
  const requestedStart = typeof searchParams.start === "string" ? searchParams.start : undefined;
  const requestedEnd = typeof searchParams.end === "string" ? searchParams.end : undefined;
  const period: DashboardPeriod =
    typeof requested === "string" && ["today", "week", "month", "year", "custom"].includes(requested)
      ? (requested as DashboardPeriod)
      : "month";
  const today = brazilToday();

  if (period === "custom" && isDate(requestedStart) && isDate(requestedEnd) && requestedStart <= requestedEnd) {
    return {
      period,
      start: requestedStart,
      end: addDays(requestedEnd, 1),
      label: `${formatDate(requestedStart)} a ${formatDate(requestedEnd)}`,
    };
  }

  if (period === "today") return { period, start: today, end: addDays(today, 1), label: "Hoje" };
  if (period === "week") return { period, start: startOfWeek(today), end: addDays(today, 1), label: "Esta semana" };
  if (period === "year") return { period, start: startOfYear(today), end: addDays(today, 1), label: "Este ano" };

  return { period: "month", start: startOfMonth(today), end: addDays(today, 1), label: "Este mês" };
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function number(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboard(data: unknown): DashboardData {
  if (!data || typeof data !== "object") return EMPTY_DASHBOARD;
  const result = data as Partial<DashboardData>;
  const metrics = result.metrics ?? EMPTY_DASHBOARD.metrics;

  return {
    metrics: {
      lojistas: number(metrics.lojistas),
      pix_aprovados: number(metrics.pix_aprovados),
      volume_pix_bruto: number(metrics.volume_pix_bruto),
      receita_taxas: number(metrics.receita_taxas),
      liquido_lojas: number(metrics.liquido_lojas),
    },
    series: Array.isArray(result.series)
      ? result.series.map((item) => ({
          data: String(item.data),
          volume_pix_bruto: number(item.volume_pix_bruto),
          receita_taxas: number(item.receita_taxas),
        }))
      : [],
    top_sellers: Array.isArray(result.top_sellers)
      ? result.top_sellers.map((item) => ({
          empresa_id: String(item.empresa_id),
          nome_empresa: String(item.nome_empresa),
          proprietario: item.proprietario ? String(item.proprietario) : null,
          pix_aprovados: number(item.pix_aprovados),
          volume_pix_bruto: number(item.volume_pix_bruto),
          receita_taxas: number(item.receita_taxas),
        }))
      : [],
  };
}

export async function getDashboardData(range: DashboardRange) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_dashboard_resumo", {
    p_inicio: `${range.start}T00:00:00-03:00`,
    p_fim: `${range.end}T00:00:00-03:00`,
  });

  if (error) {
    return { dashboard: EMPTY_DASHBOARD, error: "Não foi possível carregar os dados do dashboard." };
  }

  return { dashboard: normalizeDashboard(data), error: null };
}

function parseStoreOrder(value: string | string[] | undefined): StoreOrder {
  return value === "new" ? "new" : "top";
}

function parsePage(value: string | string[] | undefined) {
  const parsed = typeof value === "string" ? Number(value) : 1;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function getDashboardStores(searchParams: Record<string, string | string[] | undefined>) {
  const order = parseStoreOrder(searchParams.storeOrder);
  const page = parsePage(searchParams.storePage);
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_dashboard_lojas", {
    p_ordenacao: order,
    p_pagina: page,
    p_por_pagina: 10,
  });

  if (error || !data || typeof data !== "object") {
    return { stores: { ...EMPTY_STORES, order }, error: "Não foi possível carregar as lojas." };
  }

  const result = data as Partial<DashboardStores>;
  const stores = Array.isArray(result.stores)
    ? result.stores.map((store) => ({
        empresa_id: String(store.empresa_id),
        nome_empresa: String(store.nome_empresa),
        slug: String(store.slug),
        whatsapp: store.whatsapp ? String(store.whatsapp) : null,
        icone_app_url: store.icone_app_url ? String(store.icone_app_url) : null,
        created_at: String(store.created_at),
        pedidos_validos: number(store.pedidos_validos),
        volume_vendido: number(store.volume_vendido),
        receita_taxas: number(store.receita_taxas),
      }))
    : [];
  const total = number(result.total);
  const perPage = number(result.perPage) || 10;
  const maxPage = Math.max(1, Math.ceil(total / perPage));

  return {
    stores: { stores, total, page: Math.min(page, maxPage), perPage, order },
    error: null,
  };
}
