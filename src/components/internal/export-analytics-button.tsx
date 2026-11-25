"use client";

import { logReportExport } from "@/app/(app)/invoices/actions";
import type { AnalyticsBucket, AnalyticsRange } from "@/lib/analytics";

interface ExportAnalyticsButtonProps {
  range: AnalyticsRange;
  periodLabel: string;
  buckets: AnalyticsBucket[];
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportAnalyticsButton({
  range,
  periodLabel,
  buckets,
}: ExportAnalyticsButtonProps) {
  const handleExport = async () => {
    try {
      await logReportExport(
        "analytics_excel_report",
        `${periodLabel} (${range}) revenue and clinic KPIs`,
      );
    } catch (e) {
      console.warn("Audit export log error:", e);
    }

    const headers = [
      "Period",
      "Revenue (EGP)",
      "Collected (EGP)",
      "Expenses (EGP)",
      "Net Profit (EGP)",
      "Collection Rate (%)",
    ];

    const rows = buckets.map((b) => {
      const net = b.collected - b.expenses;
      const rate = b.revenue > 0 ? Math.round((b.collected / b.revenue) * 100) : 0;
      return [
        escapeCsvCell(b.label),
        b.revenue,
        b.collected,
        b.expenses,
        net,
        `${rate}%`,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Northline-Analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={handleExport}
      disabled={buckets.length === 0}
      title={buckets.length === 0 ? "No data in selected period to export" : `Export ${periodLabel} to Excel / CSV`}
    >
      Export {range} to Excel / CSV
    </button>
  );
}
