import { desc, isNull, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, labOrders, patients, staffMembers } from "@/db";
import { LabsClient } from "./labs-client";

export const metadata = { title: "Laboratory Orders — Northline Dental Clinic" };

export default async function LabsPage() {
  await getSession();
  const db = getDb();

  const [ordersRows, patientsRows, doctorsRows] = await Promise.all([
    db.select().from(labOrders).orderBy(desc(labOrders.createdAt)),
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
    <LabsClient
      initialOrders={ordersRows}
      patients={patientsRows}
      doctors={doctorsRows}
    />
  );
}
