function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.08] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] p-4 text-zinc-100 sm:p-6" aria-busy="true" aria-label="Carregando dashboard">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl sm:min-h-[calc(100vh-3rem)]">
        <aside className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-row items-center gap-3 rounded-[28px] border border-white/[0.08] bg-[#151518] px-3 py-3 sm:bottom-auto sm:left-6 sm:top-1/2 sm:w-20 sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:gap-5 sm:rounded-[34px] sm:px-0 sm:py-5">
          <Skeleton className="size-10 rounded-[18px] sm:size-11" />
          <div className="flex gap-2 sm:flex-col sm:gap-3"><Skeleton className="size-11 rounded-2xl" /><Skeleton className="size-11 rounded-2xl" /><Skeleton className="size-11 rounded-2xl" /></div>
        </aside>

        <section className="min-w-0 flex-1 pb-24 pt-2 sm:ml-[104px] sm:py-4">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-60" /><Skeleton className="h-4 w-72" /></div><Skeleton className="h-12 w-full sm:w-96" /></header>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <article key={index} className={`rounded-3xl border p-5 sm:p-6 ${index === 0 ? "border-lime-300/20 bg-lime-300/15" : "border-white/[0.08] bg-[#151518]"}`}><Skeleton className="h-4 w-28" /><Skeleton className="mt-5 h-8 w-36" /><Skeleton className="mt-3 h-3 w-40" /></article>)}</section>
            <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.9fr]"><article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><Skeleton className="h-4 w-36" /><Skeleton className="mt-3 h-4 w-56" /><div className="mt-8 flex h-48 items-end gap-3">{Array.from({ length: 12 }).map((_, index) => <Skeleton key={index} className="flex-1 rounded-b-none" />)}</div></article><article className="rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><Skeleton className="h-4 w-28" /><Skeleton className="mt-5 h-10 w-20" /><div className="my-7 h-px bg-white/[0.08]" /><div className="space-y-5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-4/6" /></div></article></section>
            <section className="mt-4 rounded-3xl border border-white/[0.08] bg-[#151518] p-5 sm:p-6"><Skeleton className="h-5 w-32" /><Skeleton className="mt-2 h-4 w-64" /><div className="mt-6 space-y-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="flex items-center gap-4"><Skeleton className="size-10 rounded-2xl" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /></div>)}</div></section>
          </div>
        </section>
      </div>
    </main>
  );
}
