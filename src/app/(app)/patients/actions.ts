"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, patients } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { FormState, isDate, isEmail, opt, str } from "@/lib/form";
import { parsePatientCode, patientCode } from "@/lib/format";

function read(f: FormData) {
  const allergies = str(f, "allergies").split(",").map((a) => a.trim()).filter(Boolean);
  return {
    fullName: str(f, "fullName"),
    dob: opt(f, "dob"),
    gender: (opt(f, "gender") as "male" | "female" | null),
    phone: str(f, "phone"),
    email: opt(f, "email"),
    nationalId: opt(f, "nationalId"),
    address: opt(f, "address"),
    bloodType: opt(f, "bloodType"),
    allergies,
    insuranceProvider: opt(f, "insuranceProvider"),
    insuranceMemberId: opt(f, "insuranceMemberId"),
    notes: opt(f, "notes"),
  };
}

function readLoyaltyPoints(f: FormData): number | null {
  const value = str(f, "loyaltyPoints");
  if (!/^\d+$/.test(value)) return null;
  const points = Number(value);
  return Number.isSafeInteger(points) && points <= 2147483647 ? points : null;
}

function validate(v: ReturnType<typeof read>): string | null {
  if (v.fullName.length < 2) return "Enter the patient's full name.";
  if (v.phone.replace(/\D/g, "").length < 7) return "Enter a phone number with at least 7 digits.";
  if (v.dob && (!isDate(v.dob) || v.dob > new Date().toISOString().slice(0, 10))) return "Date of birth is not valid.";
  if (v.email && !isEmail(v.email)) return "Email address is not valid.";
  if (v.gender && v.gender !== "male" && v.gender !== "female") return "Choose a gender from the list.";
  return null;
}

export async function createPatient(_: FormState, f: FormData): Promise<FormState> {
  const s = await requirePerm("patients:write");
  const v = read(f);
  const err = validate(v);
  if (err) return { ok: false, error: err };

  const db = getDb();
  const [dupe] = await db.select({ no: patients.patientNo }).from(patients)
    .where(and(eq(patients.phone, v.phone), isNull(patients.archivedAt))).limit(1);
  if (dupe) return { ok: false, error: `A patient with this phone already exists (${patientCode(dupe.no)}).` };

  const [row] = await db.insert(patients).values(v).returning();
  await logAudit(s, { action: "create", entity: "patient", entityId: row.id, after: row });
  revalidatePath("/patients");
  redirect(`/patients/${patientCode(row.patientNo)}`);
}

export async function updatePatient(code: string, _: FormState, f: FormData): Promise<FormState> {
  const s = await requirePerm("patients:write");
  const no = parsePatientCode(code);
  if (no === null) return { ok: false, error: "Unknown patient." };
  const v = read(f);
  const err = validate(v);
  if (err) return { ok: false, error: err };
  const loyaltyPoints = readLoyaltyPoints(f);
  if (loyaltyPoints === null) {
    return { ok: false, error: "Enter a whole number of loyalty points from 0 to 2,147,483,647." };
  }

  const db = getDb();
  const [before] = await db.select().from(patients).where(eq(patients.patientNo, no)).limit(1);
  if (!before) return { ok: false, error: "Patient not found." };
  const [after] = await db.update(patients).set({ ...v, loyaltyPoints, updatedAt: new Date() })
    .where(eq(patients.patientNo, no)).returning();
  await logAudit(s, { action: "update", entity: "patient", entityId: after.id, before, after });
  revalidatePath("/patients");
  revalidatePath(`/patients/${code}`);
  revalidatePath("/loyalty-points");
  redirect(`/patients/${code}`);
}

export async function archivePatient(code: string) {
  const s = await requirePerm("patients:archive");
  const no = parsePatientCode(code);
  if (no === null) return;
  const [row] = await getDb().update(patients).set({ archivedAt: new Date(), status: "inactive" })
    .where(eq(patients.patientNo, no)).returning();
  if (row) await logAudit(s, { action: "archive", entity: "patient", entityId: row.id });
  revalidatePath("/patients");
  redirect("/patients");
}
