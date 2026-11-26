"use server";

import { and, eq, ilike, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, patientArrivals, patients } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";

export async function addArrivalAsPatient(arrivalId: string) {
  const s = await requirePerm("patients:write");
  const db = getDb();

  const [arrival] = await db
    .select()
    .from(patientArrivals)
    .where(eq(patientArrivals.id, arrivalId))
    .limit(1);

  if (!arrival) {
    return { ok: false, error: "Arrival record not found." };
  }

  // Check if a matching patient already exists in Supabase
  const matchConditions = [
    arrival.email ? ilike(patients.email, arrival.email) : undefined,
    arrival.phone ? eq(patients.phone, arrival.phone) : undefined,
    arrival.username ? eq(patients.phone, arrival.username) : undefined,
  ].filter(Boolean);

  if (matchConditions.length > 0) {
    const [existing] = await db
      .select()
      .from(patients)
      .where(and(isNull(patients.archivedAt), or(...matchConditions)))
      .limit(1);

    if (existing) {
      await db
        .update(patientArrivals)
        .set({ patientId: existing.id, updatedAt: new Date() })
        .where(eq(patientArrivals.id, arrival.id));
      revalidatePath("/qr");
      return { ok: true, linked: true, patientId: existing.id };
    }
  }

  const candidatePhone =
    arrival.phone ||
    (arrival.username && arrival.username.replace(/\D/g, "").length >= 7
      ? arrival.username
      : null);

  if (!candidatePhone) {
    return { ok: false, needsPhone: true };
  }

  const [created] = await db
    .insert(patients)
    .values({
      fullName: arrival.memberName,
      email: arrival.email,
      phone: candidatePhone,
      status: "active",
    })
    .returning();

  await db
    .update(patientArrivals)
    .set({ patientId: created.id, updatedAt: new Date() })
    .where(eq(patientArrivals.id, arrival.id));

  await logAudit(s, {
    action: "create",
    entity: "patient",
    entityId: created.id,
    after: created,
  });

  revalidatePath("/qr");
  revalidatePath("/patients");
  return { ok: true, patientId: created.id };
}
