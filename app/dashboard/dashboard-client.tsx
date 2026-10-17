"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Home, MessageCircle, Settings, Store, TrendingUp, UsersRound, WalletCards } from "lucide-react";

import type { DashboardData, DashboardPeriod, DashboardRange, DashboardStores, StoreOrder } from "@/app/lib/dashboard";
import PushNotificationButton from "./push-notification-button";

export type DashboardSection = "inicio" | "lojas" | "configuracoes";

const navigation = [
  { id: "inicio" as const, label: "Início", icon: Home },
  { id: "lojas" as const, label: "Lojas", icon: Store },
  { id: "configuracoes" as const, label: "Configurações", icon: Settings },
];

const periods: Array<{ id: Exclude<DashboardPeriod, "custom">; label: string }> = [
  { id: "today", label: "Hoje" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mês" },
  { id: "year", label: "Este ano" },
];

type Props = { dashboard: DashboardData; range: DashboardRange; error: string | null; stores: DashboardStores; storesError: string | null; initialSection: DashboardSection };

export default function DashboardClient({ dashboard, range, error, stores, storesError, initialSection }: Props) {
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection);

  return (
    <main className="min-h-screen bg-[#0a0a0c] p-4 text-zinc-100 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl sm:min-h-[calc(100vh-3rem)]">
        <aside className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-row items-center gap-3 rounded-[28px] border border-white/[0.08] bg-[#151518] px-3 py-3 shadow-2xl shadow-black/30 sm:bottom-auto sm:left-6 sm:top-1/2 sm:w-20 sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:gap-5 sm:rounded-[34px] sm:px-0 sm:py-5">
          <div className="grid size-10 place-items-center overflow-hidden rounded-[18px] sm:size-11">
            <Image src="/icons/icon-adminnoapp-512.png" alt="AdminNoApp" width={44} height={44} priority />
          </div>
          <nav className="flex flex-row gap-2 sm:flex-col sm:gap-3" aria-label="Navegação principal">
            {navigation.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return <button key={id} className={`group relative grid size-11 place-items-center rounded-2xl transition ${isActive ? "bg-lime-300 text-zinc-900 shadow-lg shadow-lime-300/10" : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"}`} type="button" onClick={() => setActiveSection(id)} aria-label={label} aria-current={isActive ? "page" : undefined}><Icon size={20} strokeWidth={2} aria-hidden="true" /><span className="pointer-events-none absolute left-[calc(100%+12px)] z-10 hidden whitespace-nowrap rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-white shadow-xl group-hover:block">{label}</span></button>;
            })}
          </nav>
        </aside>
        <section className="min-w-0 flex-1 pb-24 pt-2 sm:ml-[104px] sm:py-4">
          {activeSection === "inicio" && <Overview dashboard={dashboard} range={range} error={error} />}
          {activeSection === "lojas" && <Stores stores={stores} error={storesError} />}
          {activeSection === "configuracoes" && <EmptySection icon={Settings} title="Configurações" />}
        </section>
      </div>
    </main>
  );
}

function Stores({ stores, error }: { stores: DashboardStores; error: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(stores.total / stores.perPage));
  const firstStore = stores.total ? (stores.page - 1) * stores.perPage + 1 : 0;
  const lastStore = Math.min(stores.page * stores.perPage, stores.total);

  function navigate(order: StoreOrder, page = 1) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("storeOrder", order);
    params.set("storePage", String(page));
    startTransition(() => router.push(`/dashboard?${params.toString()}`));
  }

  return <div className="mx-auto max-w-4xl">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-sm text-zinc-500">Rede de lojas</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lojistas</h1><p className="mt-1 text-sm text-zinc-500">{formatCount(stores.total)} lojas cadastradas</p></div><div className="flex rounded-2xl border border-white/[0.08] bg-[#17171a] p-1.5"><StoreChip active={stores.order === "top"} disabled={isPending} onClick={() => navigate("top")} label="Top Sellers" /><StoreChip active={stores.order === "new"} disabled={isPending} onClick={() => navigate("new")} label="Novos Sellers" /></div></header>
    {error && <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100" role="status">{error} Confirme se a migration de lojas foi aplicada no Supabase.</div>}
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#151518]">
      {stores.stores.length ? <ul className="divide-y divide-white/[0.06]">{stores.stores.map((store) => <li key={store.empresa_id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><StoreIcon src={store.icone_app_url} name={store.nome_empresa} /><div className="min-w-0 flex-1"><p className="truncate font-medium text-zinc-100">{store.nome_empresa}</p><p className="mt-0.5 truncate text-xs text-zinc-500">/{store.slug}</p></div><div className="text-right"><div className="flex items-center justify-end gap-1.5"><span className="rounded-full bg-lime-300/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-300">Receita</span><p className="text-sm font-medium text-zinc-200">{formatMoney(store.receita_taxas)}</p></div><p className="mt-1 text-xs text-zinc-500">{formatCount(store.pedidos_validos)} pedidos</p></div><span title="WhatsApp em breve" className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-600"><MessageCircle size={19} aria-label="WhatsApp em breve" /></span></li>)}</ul> : <div className="grid h-52 place-items-center px-6 text-center text-sm text-zinc-500">Nenhuma loja encontrada.</div>}
      {stores.total > 0 && <footer className="flex flex-col gap-3 border-t border-white/[0.06] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="text-zinc-500">Mostrando {firstStore}–{lastStore} de {formatCount(stores.total)}</span><div className="flex items-center gap-2"><button type="button" aria-label="Página anterior" disabled={isPending || stores.page <= 1} onClick={() => navigate(stores.order, stores.page - 1)} className="grid size-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} /></button><span className="min-w-24 text-center text-xs text-zinc-500">Página {stores.page} de {totalPages}</span><button type="button" aria-label="Próxima página" disabled={isPending || stores.page >= totalPages} onClick={() => navigate(stores.order, stores.page + 1)} className="grid size-9 place-items-center rounded-xl border border-white/[0.08] text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={18} /></button></div></footer>}
    </section>
  </div>;
}

function StoreChip({ active, disabled, label, onClick }: { active: boolean; disabled: boolean; label: string; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl px-3 py-2 text-sm transition ${active ? "bg-lime-300 font-medium text-zinc-950" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"}`}>{label}</button>;
}

function StoreIcon({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.trim().slice(0, 2).toUpperCase();
  return <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-lime-300/15 text-sm font-semibold text-lime-300">{src && !failed ? <Image src={src} alt={`Ícone da ${name}`} width={48} height={48} className="size-full object-cover" onError={() => setFailed(true)} /> : initials}</div>;
}

function Overview({ dashboard, range, error }: Pick<Props, "dashboard" | "range" | "error">) {
  return <div className="mx-auto max-w-6xl">
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-1 text-sm text-zinc-500">Visão geral</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Olá, Administrador</h1><p className="mt-1 text-sm text-zinc-500">Dados realizados em Pix aprovado · {range.label}</p></div><div className="flex flex-col items-start gap-3 sm:items-end"><PushNotificationButton /><PeriodPicker range={range} /></div></header>
    {error && <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100" role="status">{error} Confirme se a migration administrativa foi aplicada no Supabase.</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard featured icon={WalletCards} label="Receita de taxas" value={formatMoney(dashboard.metrics.receita_taxas)} detail="taxas gravadas nas transações" /><MetricCard icon={UsersRound} label="Lojistas" value={formatCount(dashboard.metrics.lojistas)} detail="donos de lojas cadastrados" /><MetricCard icon={TrendingUp} label="Volume Pix bruto" value={formatMoney(dashboard.metrics.volume_pix_bruto)} detail={`${formatCount(dashboard.metrics.pix_aprovados)} pagamentos aprovados`} /><MetricCard icon={Store} label="Líquido às lojas" value={formatMoney(dashboard.metrics.liquido_lojas)} detail="valor recebido pelos vendedores" /></section>
    <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.9fr]"><RevenueChart series={dashboard.series} /><article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><div className="flex items-center justify-between"><p className="text-sm text-zinc-400">Resumo Pix</p><WalletCards size={19} className="text-lime-300" aria-hidden="true" /></div><p className="mt-4 text-4xl font-semibold tracking-tight">{formatCount(dashboard.metrics.pix_aprovados)}</p><p className="mt-1 text-sm text-zinc-500">pagamentos aprovados no período</p><div className="my-7 h-px bg-white/[0.08]" /><div className="space-y-4 text-sm"><SummaryLine label="Volume transacionado" value={formatMoney(dashboard.metrics.volume_pix_bruto)} color="bg-lime-300" /><SummaryLine label="Taxas do Pedidonoapp" value={formatMoney(dashboard.metrics.receita_taxas)} color="bg-emerald-400" /><SummaryLine label="Recebido pelas lojas" value={formatMoney(dashboard.metrics.liquido_lojas)} color="bg-sky-300" /></div></article></section>
    <TopSellers sellers={dashboard.top_sellers} />
  </div>;
}

function PeriodPicker({ range }: { range: DashboardRange }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCustom, setShowCustom] = useState(range.period === "custom");
  const [start, setStart] = useState(range.start);
  const [end, setEnd] = useState(range.period === "custom" ? previousDay(range.end) : range.start);
  const selectPeriod = (period: DashboardPeriod) => { setShowCustom(period === "custom"); if (period !== "custom") startTransition(() => router.push(`/dashboard?period=${period}`)); };
  const applyCustom = () => { if (start && end && start <= end) startTransition(() => router.push(`/dashboard?period=custom&start=${start}&end=${end}`)); };

  return <div className="w-full sm:w-auto"><div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#17171a] p-1.5">{periods.map((period) => <button key={period.id} type="button" disabled={isPending} onClick={() => selectPeriod(period.id)} className={`rounded-xl px-3 py-2 text-sm transition ${range.period === period.id ? "bg-lime-300 font-medium text-zinc-950" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"}`}>{period.label}</button>)}<button type="button" disabled={isPending} onClick={() => selectPeriod("custom")} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition ${range.period === "custom" ? "bg-lime-300 font-medium text-zinc-950" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"}`}><CalendarDays size={15} aria-hidden="true" />Personalizado<ChevronDown size={14} aria-hidden="true" /></button></div>{showCustom && <div className="mt-2 flex flex-wrap items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#17171a] p-3"><label className="text-xs text-zinc-500">Início<input aria-label="Data inicial" type="date" value={start} max={end} onChange={(event) => setStart(event.target.value)} className="mt-1 block rounded-lg border border-white/[0.08] bg-[#0f0f11] px-2 py-1.5 text-sm text-zinc-200" /></label><label className="text-xs text-zinc-500">Fim<input aria-label="Data final" type="date" value={end} min={start} onChange={(event) => setEnd(event.target.value)} className="mt-1 block rounded-lg border border-white/[0.08] bg-[#0f0f11] px-2 py-1.5 text-sm text-zinc-200" /></label><button type="button" disabled={isPending || !start || !end || start > end} onClick={applyCustom} className="rounded-lg bg-lime-300 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50">Aplicar</button></div>}</div>;
}

function RevenueChart({ series }: { series: DashboardData["series"] }) {
  const maximum = Math.max(...series.map((item) => item.volume_pix_bruto), 1);
  return <article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-zinc-400">Volume Pix por dia</p><p className="mt-2 text-sm text-zinc-500">Somente transações aprovadas e realizadas.</p></div><span className="rounded-full bg-lime-300/10 px-2.5 py-1 text-xs font-medium text-lime-300">Dados reais</span></div>{series.length ? <><div className="mt-8 flex h-48 items-end gap-2 overflow-x-auto pb-1 sm:gap-3" aria-label="Gráfico de volume Pix">{series.map((item) => <div key={item.data} className="group flex h-full min-w-8 flex-1 items-end" title={`${formatDate(item.data)}: ${formatMoney(item.volume_pix_bruto)}`}><div className="w-full rounded-t-md bg-lime-300/30 transition group-hover:bg-lime-300" style={{ height: `${Math.max((item.volume_pix_bruto / maximum) * 100, 3)}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-xs text-zinc-600"><span>{formatDate(series[0].data)}</span><span>{formatDate(series[series.length - 1].data)}</span></div></> : <div className="mt-8 grid h-48 place-items-center rounded-2xl border border-dashed border-white/[0.08] text-sm text-zinc-500">Nenhum Pix aprovado neste período.</div>}</article>;
}

function TopSellers({ sellers }: { sellers: DashboardData["top_sellers"] }) {
  return <section className="mt-4 rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="font-semibold">Top Sellers</h2><p className="mt-1 text-sm text-zinc-500">As 4 lojas com maior volume em Pix aprovado no período.</p></div><span className="rounded-full bg-lime-300/10 px-2.5 py-1 text-xs font-medium text-lime-300">Top 4</span></div>{sellers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-zinc-600"><tr><th className="pb-3 font-medium">Loja</th><th className="pb-3 font-medium">Proprietário</th><th className="pb-3 text-right font-medium">Pix aprovados</th><th className="pb-3 text-right font-medium">Volume vendido</th><th className="pb-3 text-right font-medium">Taxas</th></tr></thead><tbody>{sellers.map((seller, index) => <tr key={seller.empresa_id} className="border-b border-white/[0.06] last:border-0"><td className="py-4 font-medium text-zinc-200"><span className="mr-3 inline-grid size-6 place-items-center rounded-full bg-white/[0.06] text-xs text-lime-300">{index + 1}</span>{seller.nome_empresa}</td><td className="py-4 text-zinc-500">{seller.proprietario ?? "—"}</td><td className="py-4 text-right text-zinc-400">{formatCount(seller.pix_aprovados)}</td><td className="py-4 text-right font-medium text-zinc-200">{formatMoney(seller.volume_pix_bruto)}</td><td className="py-4 text-right text-lime-300">{formatMoney(seller.receita_taxas)}</td></tr>)}</tbody></table></div> : <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-white/[0.08] text-sm text-zinc-500">Nenhuma loja com Pix aprovado neste período.</div>}</section>;
}

function MetricCard({ icon: Icon, label, value, detail, featured = false }: { icon: typeof Store; label: string; value: string; detail: string; featured?: boolean }) { return <article className={`rounded-3xl border p-5 sm:p-6 ${featured ? "border-lime-200 bg-lime-300 text-zinc-950" : "border-white/[0.08] bg-[#151518]"}`}><div className="flex items-center justify-between"><p className={`text-sm ${featured ? "text-zinc-800" : "text-zinc-500"}`}>{label}</p><Icon size={19} className={featured ? "text-zinc-800" : "text-lime-300"} aria-hidden="true" /></div><strong className="mt-4 block text-xl font-semibold tracking-tight sm:text-2xl">{value}</strong><p className={`mt-2 text-xs ${featured ? "text-zinc-800" : "text-zinc-500"}`}>{detail}</p></article>; }
function SummaryLine({ label, value, color }: { label: string; value: string; color: string }) { return <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-zinc-400"><i className={`size-2 shrink-0 rounded-full ${color}`} />{label}</span><span className="text-right font-medium text-zinc-200">{value}</span></div>; }
function EmptySection({ icon: Icon, title }: { icon: typeof Store; title: string }) { return <div className="flex min-h-[70vh] flex-col items-center justify-center text-center"><div className="grid size-14 place-items-center rounded-2xl bg-lime-300 text-zinc-900"><Icon size={24} aria-hidden="true" /></div><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-zinc-500">Esta seção receberá suas informações em breve.</p></div>; }
function formatMoney(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function formatCount(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }
function formatDate(date: string) { const [year, month, day] = date.split("-"); return `${day}/${month}/${year}`; }
function previousDay(date: string) { const value = new Date(`${date}T00:00:00Z`); value.setUTCDate(value.getUTCDate() - 1); return value.toISOString().slice(0, 10); }
