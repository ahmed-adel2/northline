"use client";

import { logReportExport } from "@/app/(app)/invoices/actions";
import { demoMonthlyRevenue } from "@/lib/demo-data";

export function ExportAnalyticsButton() {
  const handleExport = async () => {
    try {
      await logReportExport("analytics_excel_report", "Monthly revenue and clinic KPIs");
    } catch (e) {
      console.warn("Audit export log error:", e);
    }

    const headers = ["Month", "Revenue (EGP)", "Expenses (EGP)", "Collected (EGP)", "Net Margin (EGP)"];
    const rows = demoMonthlyRevenue.map((m) => [
      m.month,
      m.revenue,
      m.expenses,
      m.collected,
      m.collected - m.expenses,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Northline-Analytics-Report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button type="button" className="button button-secondary" onClick={handleExport}>
      Export report to Excel / CSV
    </button>
  );
}
