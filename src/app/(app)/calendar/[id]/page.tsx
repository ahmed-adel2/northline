import Link from "next/link";
import { and, asc, eq, isNull, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AppointmentForm } from "@/components/internal/appointment-form";
import { ConfirmButton } from "@/components/internal/confirm-button";
import { appointments, getDb, patients, staffMembers } from "@/db";
import { requirePerm } from "@/lib/auth";
import { patientCode } from "@/lib/format";
import { setAppointmentStatus, updateAppointment } from "../actions";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditAppointment({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("appointments:write");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const db = getDb();
  const [a] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  if (!a) notFound();
  const [pts, docs] = await Promise.all([
    db.select({ id: patients.id, no: patients.patientNo, name: patients.fullName }).from(patients)
      .where(or(isNull(patients.archivedAt), eq(patients.id, a.patientId))).orderBy(asc(patients.fullName)),
    db.select({ id: staffMembers.id, name: staffMembers.fullName }).from(staffMembers)
      .where(and(eq(staffMembers.role, "dentist"), eq(staffMembers.active, true))).orderBy(asc(staffMembers.fullName)),
  ]);
  return (
    <div className="m-stack" style={{ maxWidth: "46rem", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div>
          <Link href={`/calendar?d=${a.apptDate}`} className="back-link">← Return to schedule</Link>
          <div className="page-header-tag" style={{ marginTop: "0.4rem" }}>
            <span>Edit Operatory Record</span>
          </div>
          <h1>Modify Appointment</h1>
          <p className="page-header-sub">Status: <span className={`badge badge-${a.status}`}>{a.status}</span></p>
        </div>
      </div>
      <div className="card" style={{ padding: "1.75rem 2rem", borderRadius: "var(--radius-lg)" }}>
        <AppointmentForm
          action={updateAppointment.bind(null, id)}
          patients={pts.map((p) => ({ id: p.id, label: `${p.name} · ${patientCode(p.no)}` }))}
          doctors={docs.map((d) => ({ id: d.id, label: d.name }))}
          defaults={{ ...a, amount: String(a.amount) }}
          submitLabel="Save changes"
        />
      </div>
      {a.status !== "cancelled" && (
        <form action={async () => { "use server"; await setAppointmentStatus(id, "cancelled"); }} style={{ marginTop: "1rem" }}>
          <ConfirmButton className="button button-secondary m-danger" message="Cancel this appointment?">Cancel appointment</ConfirmButton>
        </form>
      )}
    </div>
  );
}
