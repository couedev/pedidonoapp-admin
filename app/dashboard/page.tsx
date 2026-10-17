import DashboardClient from "./dashboard-client";
import { getDashboardData, getDashboardRange, getDashboardStores } from "@/app/lib/dashboard";

// A dashboard autenticada depende de cookies e dos filtros da requisição.
export const instant = false;

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const range = getDashboardRange(searchParams);
  const [{ dashboard, error }, { stores, error: storesError }] = await Promise.all([
    getDashboardData(range),
    getDashboardStores(searchParams),
  ]);

  return <DashboardClient dashboard={dashboard} range={range} error={error} stores={stores} storesError={storesError} initialSection={searchParams.section === "lojas" ? "lojas" : "inicio"} />;
}
