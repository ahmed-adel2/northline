import { isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, patients, toothFindings } from "@/db";
import { ClinicalClient } from "./clinical-client";

export const metadata = { title: "Odontogram & Tooth Chart — Northline Dental Clinic" };

export default async function ClinicalPage() {
  await getSession();
  const db = getDb();

  const [patientsRows, findingsRows] = await Promise.all([
    db
      .select({
        id: patients.id,
        patientNo: patients.patientNo,
        fullName: patients.fullName,
        phone: patients.phone,
      })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(patients.fullName),
    db.select().from(toothFindings),
  ]);

  return (
    <ClinicalClient
      patients={patientsRows}
      initialFindings={findingsRows}
    />
  );
}
