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
  return { ok: true, data: updated };
}
