import { gte } from "drizzle-orm";
import { getDb, appointments, insuranceClaims, invoices, patients } from "@/db";

export type AnalyticsRange = "daily" | "weekly" | "monthly" | "yearly" | "all";

export interface AnalyticsBucket {
  key: string;
  label: string;
  revenue: number;
  collected: number;
  expenses: number;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  periodLabel: string;
  buckets: AnalyticsBucket[];
  totalRevenue: number;
  totalCollected: number;
  totalExpenses: number;
  netProfit: number;
  collectionRate: number;
  patientStats: {
    total: number;
    active: number;
    overdue: number;
    inactive: number;
  };
  topProcedures: Array<{ procedure: string; count: number }>;
}

const VALID_RANGES = new Set<AnalyticsRange>(["daily", "weekly", "monthly", "yearly", "all"]);

export function parseAnalyticsRange(value?: string | string[]): AnalyticsRange {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && VALID_RANGES.has(raw as AnalyticsRange)) {
    return raw as AnalyticsRange;
  }
  return "monthly";
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getStartDateForRange(range: AnalyticsRange, now: Date): Date | null {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  switch (range) {
    case "daily":
      d.setDate(d.getDate() - 13); // last 14 days
      return d;
    case "weekly":
      d.setDate(d.getDate() - 7 * 11); // last 12 weeks
      return d;
    case "monthly":
      d.setMonth(d.getMonth() - 11, 1); // last 12 months
      return d;
    case "yearly":
      d.setFullYear(d.getFullYear() - 4, 0, 1); // last 5 years
      return d;
    case "all":
      return null;
  }
}

function getPeriodLabel(range: AnalyticsRange): string {
  switch (range) {
    case "daily":
      return "Last 14 days";
    case "weekly":
      return "Last 12 weeks";
    case "monthly":
      return "Last 12 months";
    case "yearly":
      return "Last 5 years";
    case "all":
      return "All history";
  }
}

function getBucketKeyAndLabel(dateStr: string, range: AnalyticsRange): { key: string; label: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { key: dateStr, label: dateStr };
  }

  if (range === "daily") {
    const key = dateStr;
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { key, label };
  }

  if (range === "weekly") {
    // Monday-based week start
    const day = d.getDay();
    const diff = (day + 6) % 7;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - diff);
    const key = toIsoDate(weekStart);
    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { key, label: `Wk ${label}` };
  }

  if (range === "monthly" || range === "all") {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return { key, label };
  }

  // yearly
  const key = String(d.getFullYear());
  return { key, label: key };
}

export async function getAnalyticsData(range: AnalyticsRange): Promise<AnalyticsData> {
  const db = getDb();
  const now = new Date();
  const startDate = getStartDateForRange(range, now);
  const startIso = startDate ? toIsoDate(startDate) : null;

  const [invoiceRows, claimRows, appointmentRows, patientRows] = await Promise.all([
    startIso
      ? db
          .select({
            issueDate: invoices.issueDate,
            total: invoices.total,
            paid: invoices.paid,
          })
          .from(invoices)
          .where(gte(invoices.issueDate, startIso))
      : db
          .select({
            issueDate: invoices.issueDate,
            total: invoices.total,
            paid: invoices.paid,
          })
          .from(invoices),
    startIso
      ? db
          .select({
            submittedDate: insuranceClaims.submittedDate,
            amount: insuranceClaims.amount,
            approvedAmount: insuranceClaims.approvedAmount,
            status: insuranceClaims.status,
          })
          .from(insuranceClaims)
          .where(gte(insuranceClaims.submittedDate, startIso))
      : db
          .select({
            submittedDate: insuranceClaims.submittedDate,
            amount: insuranceClaims.amount,
            approvedAmount: insuranceClaims.approvedAmount,
            status: insuranceClaims.status,
          })
          .from(insuranceClaims),
    startIso
      ? db
          .select({
            procedure: appointments.procedure,
            status: appointments.status,
          })
          .from(appointments)
          .where(gte(appointments.apptDate, startIso))
      : db
          .select({
            procedure: appointments.procedure,
            status: appointments.status,
          })
          .from(appointments),
    db
      .select({
        status: patients.status,
      })
      .from(patients),
  ]);

  const bucketMap = new Map<string, AnalyticsBucket>();

  for (const inv of invoiceRows) {
    const { key, label } = getBucketKeyAndLabel(inv.issueDate, range);
    const revenue = Number(inv.total ?? 0);
    const collected = Number(inv.paid ?? 0);
    // Operating expenses are not stored in a separate table; estimate 32% of billed revenue when no expense ledger exists
    const expenses = Math.round(revenue * 0.32);

    const existing = bucketMap.get(key);
    if (existing) {
      existing.revenue += revenue;
      existing.collected += collected;
      existing.expenses += expenses;
    } else {
      bucketMap.set(key, {
        key,
        label,
        revenue,
        collected,
        expenses,
      });
    }
  }

  for (const claim of claimRows) {
    if (claim.status !== "approved" || !claim.submittedDate) continue;
    const { key, label } = getBucketKeyAndLabel(claim.submittedDate, range);
    const approved = Number(claim.approvedAmount ?? claim.amount ?? 0);
    if (approved <= 0) continue;

    const existing = bucketMap.get(key);
    if (existing) {
      existing.collected += approved;
    } else {
      bucketMap.set(key, {
        key,
        label,
        revenue: approved,
        collected: approved,
        expenses: Math.round(approved * 0.32),
      });
    }
  }

  const buckets = Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));

  const totalRevenue = buckets.reduce((s, b) => s + b.revenue, 0);
  const totalCollected = buckets.reduce((s, b) => s + b.collected, 0);
  const totalExpenses = buckets.reduce((s, b) => s + b.expenses, 0);
  const netProfit = totalCollected - totalExpenses;
  const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

  const procedureCounts: Record<string, number> = {};
  for (const appt of appointmentRows) {
    if (appt.status === "completed") {
      procedureCounts[appt.procedure] = (procedureCounts[appt.procedure] ?? 0) + 1;
    }
  }
  const topProcedures = Object.entries(procedureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([procedure, count]) => ({ procedure, count }));

  const active = patientRows.filter((p) => p.status === "active").length;
  const overdue = patientRows.filter((p) => p.status === "overdue").length;
  const inactive = patientRows.filter((p) => p.status === "inactive").length;

  return {
    range,
    periodLabel: getPeriodLabel(range),
    buckets,
    totalRevenue,
    totalCollected,
    totalExpenses,
    netProfit,
    collectionRate,
    patientStats: {
      total: patientRows.length,
      active,
      overdue,
      inactive,
    },
    topProcedures,
  };
}
