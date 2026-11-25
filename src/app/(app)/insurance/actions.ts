"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, insuranceClaims, patients } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export async function createInsuranceClaim(formData: FormData) {
  const s = await requirePerm("invoices:write");
  const patientId = str(formData, "patientId");
  const insurance = str(formData, "insurance");
  const memberId = opt(formData, "memberId");
  const amount = parseFloat(str(formData, "amount")) || 0;
  const notes = opt(formData, "notes");

  const db = getDb();
  let patientName = "Patient";
  if (patientId) {
    const [p] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (p) patientName = p.fullName;
  }

  const claimNo = `CLM-${String(Date.now()).slice(-4)}`;
  const submittedDate = new Date().toISOString().slice(0, 10);

  const [created] = await db
    .insert(insuranceClaims)
    .values({
      claimNo,
      patientId: patientId || null,
      patientName,
      insurance,
      memberId,
      submittedDate,
      amount: String(amount),
      status: "submitted",
      notes,
    })
    .returning();

  await logAudit(s, { action: "create", entity: "insurance_claim", entityId: created.id, after: created });
  revalidatePath("/insurance");
  revalidatePath("/analytics");
  return { ok: true, data: created };
}

export async function approveInsuranceClaim(claimId: string) {
  const s = await requirePerm("invoices:write");
  const db = getDb();

  const [claim] = await db.select().from(insuranceClaims).where(eq(insuranceClaims.id, claimId)).limit(1);
  if (!claim) return { ok: false, error: "Claim not found" };

  const [updated] = await db
    .update(insuranceClaims)
    .set({
      status: "approved",
      approvedAmount: claim.amount,
      updatedAt: new Date(),
    })
    .where(eq(insuranceClaims.id, claimId))
    .returning();

  await logAudit(s, {
    action: "approve",
    entity: "insurance_claim",
    entityId: claimId,
    before: { status: claim.status },
    after: { status: "approved", approvedAmount: claim.amount },
  });

  revalidatePath("/insurance");
  revalidatePath("/analytics");
  return { ok: true, data: updated };
}

export async function updateInsuranceClaim(claimId: string, formData: FormData) {
  const s = await requirePerm("invoices:write");
  const db = getDb();

  const [claim] = await db.select().from(insuranceClaims).where(eq(insuranceClaims.id, claimId)).limit(1);
  if (!claim) return { ok: false, error: "Claim not found" };

  const patientId = str(formData, "patientId");
  const claimNo = str(formData, "claimNo");
  const insurance = str(formData, "insurance");
  const memberId = opt(formData, "memberId");
  const submittedDate = opt(formData, "submittedDate");
  const amountValue = Number(str(formData, "amount"));
  const approvedAmountValue = opt(formData, "approvedAmount");
  const approvedAmount = approvedAmountValue ? Number(approvedAmountValue) : null;
  const status = str(formData, "status");
  const rejectionReason = opt(formData, "rejectionReason");
  const notes = opt(formData, "notes");
  const invoiceId = opt(formData, "invoiceId");
  const allowedStatuses = ["draft", "submitted", "pending", "approved", "partial", "rejected"];

  if (!claimNo || !insurance) return { ok: false, error: "Claim number and insurance provider are required." };
  if (!Number.isFinite(amountValue) || amountValue < 0) return { ok: false, error: "Enter a valid claim amount of zero or more." };
  if (approvedAmount !== null && (!Number.isFinite(approvedAmount) || approvedAmount < 0)) {
    return { ok: false, error: "Enter a valid approved amount of zero or more, or leave it blank." };
  }
  if (!allowedStatuses.includes(status)) return { ok: false, error: "Choose a valid claim status." };
  if (submittedDate && !/^\d{4}-\d{2}-\d{2}$/.test(submittedDate)) {
    return { ok: false, error: "Enter a valid submitted date." };
  }

  const [patient] = patientId
    ? await db.select({ id: patients.id, name: patients.fullName }).from(patients).where(eq(patients.id, patientId)).limit(1)
    : [];
  if (patientId && !patient) return { ok: false, error: "Select a patient on file." };

  const changes = {
    claimNo,
    patientId: patientId || null,
    patientName: patient?.name ?? claim.patientName,
    insurance,
    memberId,
    submittedDate,
    amount: String(amountValue),
    approvedAmount: approvedAmount === null ? null : String(approvedAmount),
    status,
    rejectionReason,
    notes,
    invoiceId,
    updatedAt: new Date(),
  };
  const [updated] = await db.update(insuranceClaims).set(changes).where(eq(insuranceClaims.id, claimId)).returning();

  await logAudit(s, { action: "update", entity: "insurance_claim", entityId: claimId, before: claim, after: updated });
  revalidatePath("/insurance");
  revalidatePath("/analytics");
  return { ok: true, data: updated };
}
