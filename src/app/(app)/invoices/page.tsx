import { desc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, invoices, patients } from "@/db";
import { InvoicesClient } from "./invoices-client";

export const metadata = { title: "Invoices & Billing — Northline Dental Clinic" };

export default async function InvoicesPage() {
  await getSession();
  const db = getDb();

  const [invoicesRows, patientsRows] = await Promise.all([
    db.select().from(invoices).orderBy(desc(invoices.createdAt)),
    db
      .select({ id: patients.id, name: patients.fullName })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(patients.fullName),
  ]);

  return (
    <InvoicesClient
      initialInvoices={invoicesRows}
      patients={patientsRows}
    />
  );
}
