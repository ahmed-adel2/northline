import { getAnalyticsData, parseAnalyticsRange } from "@/lib/analytics";
import { AnalyticsClient } from "./analytics-client";

export const metadata = { title: "Financial & Practice Analytics — Northline Dental Clinic" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);
  const data = await getAnalyticsData(range);

  return <AnalyticsClient data={data} />;
}
