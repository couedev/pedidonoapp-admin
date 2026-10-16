"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Home,
  MoreHorizontal,
  Settings,
  Store,
  WalletCards,
} from "lucide-react";

type Section = "inicio" | "lojas" | "configuracoes";

const navigation = [
  { id: "inicio" as const, label: "Início", icon: Home },
  { id: "lojas" as const, label: "Lojas", icon: Store },
  { id: "configuracoes" as const, label: "Configurações", icon: Settings },
];

const transactions = [
  { store: "Burger House", order: "#1048", value: "R$ 86,90", status: "Pago" },
  { store: "Sushi & Co.", order: "#2041", value: "R$ 124,50", status: "Pago" },
  { store: "Pizzaria Central", order: "#3310", value: "R$ 72,00", status: "Pago" },
  { store: "Café da Praça", order: "#0987", value: "R$ 38,90", status: "Pendente" },
];

const chartValues = [42, 57, 47, 73, 62, 82, 68, 92, 76, 87, 65, 95];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("inicio");

  return (
    <main className="min-h-screen bg-[#0a0a0c] p-4 text-zinc-100 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl sm:min-h-[calc(100vh-3rem)]">
        <aside className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-row items-center gap-3 rounded-[28px] border border-white/[0.08] bg-[#151518] px-3 py-3 shadow-2xl shadow-black/30 sm:bottom-auto sm:left-6 sm:top-1/2 sm:w-20 sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:gap-5 sm:rounded-[34px] sm:px-0 sm:py-5">
          <div className="grid size-10 place-items-center overflow-hidden rounded-[18px] sm:size-11">
            <Image
              src="/icons/icon-adminnoapp-512.png"
              alt="AdminNoApp"
              width={44}
              height={44}
              priority
            />
          </div>

          <nav className="flex flex-row gap-2 sm:flex-col sm:gap-3" aria-label="Navegação principal">
            {navigation.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;

              return (
                <button
                  key={id}
                  className={`group relative grid size-11 place-items-center rounded-2xl transition ${
                    isActive
                      ? "bg-lime-300 text-zinc-900 shadow-lg shadow-lime-300/10"
                      : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  }`}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  <span className="pointer-events-none absolute left-[calc(100%+12px)] z-10 hidden whitespace-nowrap rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-white shadow-xl group-hover:block">
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 pb-24 pt-2 sm:ml-[104px] sm:py-4">
          {activeSection === "inicio" && <Overview />}
          {activeSection === "lojas" && <EmptySection icon={Store} title="Lojas delivery" />}
          {activeSection === "configuracoes" && <EmptySection icon={Settings} title="Configurações" />}
        </section>
      </div>
    </main>
  );
}

function Overview() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-zinc-500">Visão geral</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Olá, Administrador</h1>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#17171a] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08]"
          type="button"
        >
          Este mês <ChevronDown size={16} aria-hidden="true" />
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Faturamento bruto" value="R$ 12.480,00" change="12,5%" positive />
        <MetricCard label="Taxas da plataforma" value="R$ 905,60" change="7,2%" />
        <MetricCard label="Faturamento líquido" value="R$ 11.574,40" change="18,4%" positive />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.9fr]">
        <article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">Faturamento</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">R$ 12.480,00</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-lime-300/10 px-2.5 py-1 text-xs font-medium text-lime-300">
              <ArrowUpRight size={14} aria-hidden="true" /> 12,5%
            </span>
          </div>
          <div className="mt-10 flex h-48 items-end gap-2 sm:gap-3" aria-label="Gráfico de faturamento mensal">
            {chartValues.map((value, index) => (
              <div key={index} className="group flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-lime-300/25 transition group-hover:bg-lime-300"
                  style={{ height: `${value}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-zinc-600">
            <span>01 Mai</span>
            <span>10 Mai</span>
            <span>20 Mai</span>
            <span>31 Mai</span>
          </div>
        </article>

        <article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Resumo de pedidos</p>
            <WalletCards size={19} className="text-lime-300" aria-hidden="true" />
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight">248</p>
          <p className="mt-1 text-sm text-zinc-500">pedidos neste período</p>
          <div className="my-7 h-px bg-white/[0.08]" />
          <div className="space-y-4 text-sm">
            <SummaryLine label="Pedidos pagos" value="231" color="bg-lime-300" />
            <SummaryLine label="Pedidos pendentes" value="17" color="bg-amber-300" />
          </div>
        </article>
      </section>

      <section className="mt-4 rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Últimas movimentações</h2>
            <p className="mt-1 text-sm text-zinc-500">Vendas recentes das suas lojas.</p>
          </div>
          <button className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white" type="button" aria-label="Mais opções">
            <MoreHorizontal size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-zinc-600">
              <tr>
                <th className="pb-3 font-medium">Loja</th>
                <th className="pb-3 font-medium">Pedido</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.order} className="border-b border-white/[0.06] last:border-0">
                  <td className="py-4 font-medium text-zinc-200">{transaction.store}</td>
                  <td className="py-4 text-zinc-500">{transaction.order}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${transaction.status === "Pago" ? "bg-lime-300/10 text-lime-300" : "bg-amber-300/10 text-amber-300"}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-zinc-200">{transaction.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, change, positive = false }: { label: string; value: string; change: string; positive?: boolean }) {
  return (
    <article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <strong className="text-xl font-semibold tracking-tight sm:text-2xl">{value}</strong>
        <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-lime-300" : "text-zinc-400"}`}>
          {positive ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
          {change}
        </span>
      </div>
    </article>
  );
}

function SummaryLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-zinc-400"><i className={`size-2 rounded-full ${color}`} />{label}</span>
      <span className="font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function EmptySection({ icon: Icon, title }: { icon: typeof Store; title: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-lime-300 text-zinc-900"><Icon size={24} aria-hidden="true" /></div>
      <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">Esta seção receberá suas informações em breve.</p>
    </div>
  );
}
