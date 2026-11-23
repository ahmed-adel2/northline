import { desc, isNull, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, treatmentPlans, patients, staffMembers } from "@/db";
import { TreatmentPlansClient } from "./treatment-plans-client";

export const metadata = { title: "Treatment Plans — Northline Dental Clinic" };

export default async function TreatmentPlansPage() {
  await getSession();
  const db = getDb();

  const [plansRows, patientsRows, doctorsRows] = await Promise.all([
    db.select().from(treatmentPlans).orderBy(desc(treatmentPlans.createdAt)),
    db
      .select({ id: patients.id, name: patients.fullName })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(patients.fullName),
    db
      .select({ id: staffMembers.id, name: staffMembers.fullName })
      .from(staffMembers)
      .where(eq(staffMembers.active, true)),
  ]);

  return (
    <TreatmentPlansClient
      initialPlans={plansRows}
      patients={patientsRows}
      doctors={doctorsRows}
    />
  );
}
