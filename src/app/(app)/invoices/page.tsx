import { desc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { clinicSettings, getDb, invoices, patients } from "@/db";
import { InvoicesClient } from "./invoices-client";

export const metadata = { title: "Invoices & Billing — Northline Dental Clinic" };

export default async function InvoicesPage() {
  await getSession();
  const db = getDb();

  const [invoicesRows, patientsRows, settingsRows] = await Promise.all([
    db.select().from(invoices).orderBy(desc(invoices.createdAt)),
    db
      .select({ id: patients.id, name: patients.fullName })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(patients.fullName),
    db.select({ clinicName: clinicSettings.clinicName }).from(clinicSettings).limit(1),
  ]);

  return (
    <InvoicesClient
      initialInvoices={invoicesRows}
      patients={patientsRows}
      clinicName={settingsRows[0]?.clinicName || "Northline Dental Clinic"}
    />
  );
}
