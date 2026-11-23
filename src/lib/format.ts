export const CURRENCY = process.env.NEXT_PUBLIC_CLINIC_CURRENCY ?? "EGP";

export const patientCode = (no: number) => `P-${String(no).padStart(3, "0")}`;
export const parsePatientCode = (c: string) => {
  const m = /^P-(\d+)$/i.exec(c);
  return m ? Number(m[1]) : null;
};

export function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}
export const fmtTime = (t: string) => t.slice(0, 5);
export const fmtMoney = (n: number | string) =>
  `${CURRENCY} ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(Number(n))}`;

/** Today's date in the clinic's timezone as YYYY-MM-DD. */
export function todayISO() {
  const tz = process.env.NEXT_PUBLIC_CLINIC_TZ ?? "Africa/Cairo";
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}
export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
