import { desc, eq } from "drizzle-orm";
import { getDb, patientArrivals, patients } from "@/db";
import { requirePerm } from "@/lib/auth";
import { patientCode } from "@/lib/format";

const TIME_ZONE = "Africa/Cairo";

function csvCell(value: string | number | null) {
  const text = String(value ?? "");
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export async function GET() {
  await requirePerm("reports:export");

  const arrivals = await getDb()
    .select({
      id: patientArrivals.id,
      arrivedAt: patientArrivals.arrivedAt,
      memberName: patientArrivals.memberName,
      email: patientArrivals.email,
      username: patientArrivals.username,
      phone: patientArrivals.phone,
      patientId: patientArrivals.patientId,
      patientNo: patients.patientNo,
    })
    .from(patientArrivals)
    .leftJoin(patients, eq(patientArrivals.patientId, patients.id))
    .orderBy(desc(patientArrivals.arrivedAt));

  const headings = [
    "Arrival ID",
    "Date (Africa/Cairo)",
    "Time (Africa/Cairo)",
    "Patient name",
    "Email",
    "Username",
    "Phone",
    "Linked patient code",
    "Linked patient ID",
  ];
  const rows = arrivals.map((arrival) => {
    const parts = dateParts(arrival.arrivedAt);
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(arrival.arrivedAt);

    return [
      arrival.id,
      date,
      time,
      arrival.memberName,
      arrival.email,
      arrival.username,
      arrival.phone,
      arrival.patientNo === null ? null : patientCode(arrival.patientNo),
      arrival.patientId,
    ].map(csvCell).join(",");
  });
  const csv = `\uFEFF${[headings.map(csvCell).join(","), ...rows].join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="northline-arrivals-history.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
