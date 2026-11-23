import { desc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, insuranceClaims, patients } from "@/db";
import { InsuranceClient } from "./insurance-client";

export const metadata = { title: "Insurance & Claims — Northline Dental Clinic" };

export default async function InsurancePage() {
  await getSession();
  const db = getDb();

  const [claimsRows, patientsRows] = await Promise.all([
    db.select().from(insuranceClaims).orderBy(desc(insuranceClaims.createdAt)),
    db
      .select({ id: patients.id, name: patients.fullName })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(patients.fullName),
  ]);

  return (
    <InsuranceClient
      initialClaims={claimsRows}
      patients={patientsRows}
    />
  );
}
