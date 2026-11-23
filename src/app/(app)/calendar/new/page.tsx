import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { AppointmentForm } from "@/components/internal/appointment-form";
import { getDb, patients, staffMembers } from "@/db";
import { requirePerm } from "@/lib/auth";
import { patientCode, todayISO } from "@/lib/format";
import { createAppointment } from "../actions";

export default async function NewAppointment({
  searchParams,
}: { searchParams: Promise<{ d?: string; patient?: string }> }) {
  await requirePerm("appointments:write");
  const sp = await searchParams;
  const db = getDb();
  const [pts, docs] = await Promise.all([
    db.select({ id: patients.id, no: patients.patientNo, name: patients.fullName }).from(patients).where(isNull(patients.archivedAt)).orderBy(asc(patients.fullName)),
    db.select({ id: staffMembers.id, name: staffMembers.fullName }).from(staffMembers).where(and(eq(staffMembers.role, "dentist"), eq(staffMembers.active, true))).orderBy(asc(staffMembers.fullName)),
  ]);
  return (
    <div className="m-stack" style={{ maxWidth: "46rem", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div>
          <Link href="/calendar" className="back-link">← Return to schedule</Link>
          <div className="page-header-tag" style={{ marginTop: "0.4rem" }}>
            <span>Operatory Booking</span>
          </div>
          <h1>Book Patient Visit</h1>
          <p className="page-header-sub">Schedule treatment session, doctor assignment, and chair</p>
        </div>
      </div>
      <div className="card" style={{ padding: "1.75rem 2rem", borderRadius: "var(--radius-lg)" }}>
        <AppointmentForm
          action={createAppointment}
          patients={pts.map((p) => ({ id: p.id, label: `${p.name} · ${patientCode(p.no)}` }))}
          doctors={docs.map((d) => ({ id: d.id, label: d.name }))}
          defaults={{ apptDate: sp.d ?? todayISO(), patientId: sp.patient }}
          submitLabel="Confirm & Book Appointment"
        />
      </div>
    </div>
  );
}
