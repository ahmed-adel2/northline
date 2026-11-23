"use server";

import { and, eq, gt, lt, ne, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appointments, getDb } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { FormState, isDate, isTime, opt, str } from "@/lib/form";

const STATUSES = ["scheduled", "confirmed", "checked-in", "in-progress", "completed", "no-show", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

function read(f: FormData) {
  return {
    patientId: str(f, "patientId"),
    doctorId: opt(f, "doctorId"),
    apptDate: str(f, "apptDate"),
    startTime: str(f, "startTime"),
    endTime: str(f, "endTime"),
    procedure: str(f, "procedure"),
    room: opt(f, "room"),
    notes: opt(f, "notes"),
    amount: String(Math.max(0, Number(str(f, "amount") || 0))),
  };
}

async function check(v: ReturnType<typeof read>, selfId?: string): Promise<string | null> {
  if (!v.patientId) return "Choose a patient.";
  if (!isDate(v.apptDate)) return "Choose a valid date.";
  if (!isTime(v.startTime) || !isTime(v.endTime)) return "Enter valid start and end times.";
  if (v.endTime <= v.startTime) return "End time must be after the start time.";
  if (v.procedure.length < 2) return "Enter the procedure or reason for the visit.";
  if (!Number.isFinite(Number(v.amount))) return "Amount is not valid.";
  if (v.doctorId) {
    const clash = await getDb().select({ id: appointments.id }).from(appointments).where(and(
      eq(appointments.doctorId, v.doctorId),
      eq(appointments.apptDate, v.apptDate),
      notInArray(appointments.status, ["cancelled", "no-show"]),
      lt(appointments.startTime, v.endTime),
      gt(appointments.endTime, v.startTime),
      selfId ? ne(appointments.id, selfId) : undefined,
    )).limit(1);
    if (clash.length) return "This doctor already has an appointment that overlaps that time.";
  }
  return null;
}

export async function createAppointment(_: FormState, f: FormData): Promise<FormState> {
  const s = await requirePerm("appointments:write");
  const v = read(f);
  const err = await check(v);
  if (err) return { ok: false, error: err };
  const [row] = await getDb().insert(appointments).values(v).returning();
  await logAudit(s, { action: "create", entity: "appointment", entityId: row.id, after: row });
  revalidatePath("/calendar");
  redirect(`/calendar?d=${v.apptDate}`);
}

export async function updateAppointment(id: string, _: FormState, f: FormData): Promise<FormState> {
  const s = await requirePerm("appointments:write");
  const v = read(f);
  const err = await check(v, id);
  if (err) return { ok: false, error: err };
  const db = getDb();
  const [before] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  if (!before) return { ok: false, error: "Appointment not found." };
  const [after] = await db.update(appointments).set({ ...v, updatedAt: new Date() })
    .where(eq(appointments.id, id)).returning();
  await logAudit(s, { action: before.apptDate !== v.apptDate || before.startTime.slice(0, 5) !== v.startTime ? "reschedule" : "update", entity: "appointment", entityId: id, before, after });
  revalidatePath("/calendar");
  redirect(`/calendar?d=${v.apptDate}`);
}

export async function setAppointmentStatus(id: string, status: string) {
  const s = await requirePerm("appointments:write");
  if (!STATUSES.includes(status as Status)) return;
  const db = getDb();
  const [before] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  if (!before) return;
  await db.update(appointments).set({ status: status as Status, updatedAt: new Date() }).where(eq(appointments.id, id));
  await logAudit(s, { action: `status:${status}`, entity: "appointment", entityId: id, before: { status: before.status }, after: { status } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
