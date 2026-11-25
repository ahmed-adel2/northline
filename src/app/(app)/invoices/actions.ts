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
  revalidatePath("/analytics");
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
  revalidatePath("/analytics");
  return { ok: true, data: updated };
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  const s = await requirePerm("invoices:write");
  const db = getDb();
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return { ok: false, error: "Invoice not found" };

  const patientId = str(formData, "patientId");
  const invoiceNo = str(formData, "invoiceNo");
  const issueDate = str(formData, "issueDate");
  const dueDate = str(formData, "dueDate");
  const subtotal = Number(str(formData, "subtotal"));
  const discount = Number(str(formData, "discount"));
  const tax = Number(str(formData, "tax"));
  const status = str(formData, "status");
  const insurance = opt(formData, "insurance");
  const insuranceClaim = opt(formData, "insuranceClaim");
  const notes = opt(formData, "notes");
  const statuses = ["draft", "issued", "partial", "paid", "overdue"];
  if (!invoiceNo || !issueDate || !dueDate) return { ok: false, error: "Invoice number and both dates are required." };
  if (![subtotal, discount, tax].every(Number.isFinite) || subtotal < 0 || discount < 0 || tax < 0 || discount > subtotal) {
    return { ok: false, error: "Enter valid amounts. Discount cannot exceed subtotal." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { ok: false, error: "Enter valid invoice dates." };
  }
  if (!statuses.includes(status)) return { ok: false, error: "Choose a valid invoice status." };

  const [patient] = patientId
    ? await db.select({ id: patients.id, name: patients.fullName }).from(patients).where(eq(patients.id, patientId)).limit(1)
    : [];
  if (patientId && !patient) return { ok: false, error: "Select a patient on file." };

  const total = subtotal - discount + tax;
  const paid = Number(invoice.paid) || 0;
  if (total < paid) return { ok: false, error: "Total cannot be less than the amount already paid." };
  const balance = total - paid;
  const resolvedStatus = balance === 0 && paid > 0 ? "paid" : paid > 0 && status === "issued" ? "partial" : status;
  const [updated] = await db.update(invoices).set({
    invoiceNo,
    patientId: patientId || null,
    patientName: patient?.name ?? invoice.patientName,
    issueDate,
    dueDate,
    subtotal: String(subtotal),
    discount: String(discount),
    tax: String(tax),
    total: String(total),
    balance: String(balance),
    status: resolvedStatus,
    insurance,
    insuranceClaim,
    notes,
    updatedAt: new Date(),
  }).where(eq(invoices.id, invoiceId)).returning();

  await logAudit(s, { action: "update", entity: "invoice", entityId: invoiceId, before: invoice, after: updated });
  revalidatePath("/invoices");
  revalidatePath("/analytics");
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
