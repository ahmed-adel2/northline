"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, invoices, patients } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export async function createInvoice(formData: FormData) {
  const s = await requirePerm("invoices:write");
  const patientId = str(formData, "patientId");
  const subtotal = parseFloat(str(formData, "subtotal")) || 0;
  const dueDate = str(formData, "dueDate");
  const insurance = opt(formData, "insurance");
  const notes = opt(formData, "notes");

  const tax = Math.round(subtotal * 0.14);
  const total = subtotal + tax;

  const db = getDb();
  let patientName = "Patient";
  if (patientId) {
    const [p] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (p) patientName = p.fullName;
  }

  const invoiceNo = `INV-${String(Date.now()).slice(-4)}`;
  const issueDate = new Date().toISOString().slice(0, 10);
  const items = [
    { description: "Dental Procedure Consultation & Service", quantity: 1, unitPrice: subtotal, total: subtotal },
  ];

  const [created] = await db
    .insert(invoices)
    .values({
      invoiceNo,
      patientId: patientId || null,
      patientName,
      status: "issued",
      issueDate,
      dueDate,
      items,
      subtotal: String(subtotal),
      discount: "0",
      tax: String(tax),
      total: String(total),
      paid: "0",
      balance: String(total),
      insurance,
      notes,
    })
    .returning();

  await logAudit(s, { action: "create", entity: "invoice", entityId: created.id, after: created });
  revalidatePath("/invoices");
  return { ok: true, data: created };
}

export async function recordInvoicePayment(invoiceId: string, amount: number, paymentMethod: string) {
  const s = await requirePerm("invoices:write");
  if (amount <= 0) return { ok: false, error: "Invalid payment amount" };

  const db = getDb();
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!inv) return { ok: false, error: "Invoice not found" };

  const total = parseFloat(inv.total) || 0;
  const paid = parseFloat(inv.paid) || 0;
  const newPaid = paid + amount;
  const newBalance = Math.max(0, total - newPaid);
  const newStatus = newBalance === 0 ? "paid" : "partial";

  const [updated] = await db
    .update(invoices)
    .set({
      paid: String(newPaid),
      balance: String(newBalance),
      status: newStatus,
      paymentMethod,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  await logAudit(s, {
    action: "payment_confirmation",
    entity: "invoice",
    entityId: invoiceId,
    before: { paid: inv.paid, balance: inv.balance, status: inv.status },
    after: { payment: amount, newPaid, newBalance, status: newStatus, paymentMethod },
  });

  revalidatePath("/invoices");
  return { ok: true, data: updated };
}

export async function logReportExport(reportType: string, filterSummary?: string) {
  const s = await requirePerm("reports:export");
  await logAudit(s, {
    action: "export_report_excel",
    entity: "report",
    after: { reportType, filterSummary, timestamp: new Date().toISOString() },
  });
  return { ok: true };
}
