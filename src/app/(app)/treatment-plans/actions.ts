"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, treatmentPlans, patients, staffMembers } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export interface PlanItem {
  tooth?: string;
  procedure: string;
  quantity: number;
  unitPrice: number;
  status: string;
}

export async function createTreatmentPlan(formData: FormData) {
  const s = await requirePerm("treatment_plans:write");
  const patientId = str(formData, "patientId");
  const doctorId = opt(formData, "doctorId");
  const procedure = str(formData, "procedure");
  const tooth = opt(formData, "tooth");
  const unitPrice = parseFloat(str(formData, "unitPrice")) || 0;
  const notes = opt(formData, "notes") || "";

  const db = getDb();
  let patientName = "Patient";
  if (patientId) {
    const [p] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (p) patientName = p.fullName;
  }

  let doctorName = "Attending Dentist";
  if (doctorId) {
    const [d] = await db.select().from(staffMembers).where(eq(staffMembers.id, doctorId)).limit(1);
    if (d) doctorName = d.fullName;
  }

  const planNo = `TP-${String(Date.now()).slice(-4)}`;

  const items: PlanItem[] = [
    {
      tooth: tooth || undefined,
      procedure,
      quantity: 1,
      unitPrice,
      status: "pending",
    },
  ];

  const [created] = await db
    .insert(treatmentPlans)
    .values({
      planNo,
      patientId: patientId || null,
      patientName,
      doctorId: doctorId || null,
      doctorName,
      status: "presented",
      createdDate: new Date().toISOString().slice(0, 10),
      items,
      totalAmount: String(unitPrice),
      paidAmount: "0",
      notes,
    })
    .returning();

  await logAudit(s, { action: "create", entity: "treatment_plan", entityId: created.id, after: created });
  revalidatePath("/treatment-plans");
  return { ok: true, data: created };
}

export async function togglePlanItemStatus(planId: string, itemIdx: number) {
  const s = await requirePerm("treatment_plans:write");
  const db = getDb();
  const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId)).limit(1);
  if (!plan) return { ok: false, error: "Plan not found" };

  const currentItems = (plan.items as PlanItem[]) || [];
  if (!currentItems[itemIdx]) return { ok: false, error: "Item not found" };

  const curr = currentItems[itemIdx].status;
  const next = curr === "pending" ? "in-progress" : curr === "in-progress" ? "completed" : "pending";
  currentItems[itemIdx] = { ...currentItems[itemIdx], status: next };

  const [updated] = await db
    .update(treatmentPlans)
    .set({ items: currentItems, updatedAt: new Date() })
    .where(eq(treatmentPlans.id, planId))
    .returning();

  await logAudit(s, {
    action: `item_status:${next}`,
    entity: "treatment_plan",
    entityId: planId,
    before: { itemIndex: itemIdx, status: curr },
    after: { itemIndex: itemIdx, status: next },
  });

  revalidatePath("/treatment-plans");
  return { ok: true, data: updated };
}

export async function recordPlanPayment(planId: string, amount: number) {
  const s = await requirePerm("treatment_plans:write");
  if (amount <= 0) return { ok: false, error: "Invalid amount" };

  const db = getDb();
  const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, planId)).limit(1);
  if (!plan) return { ok: false, error: "Plan not found" };

  const total = parseFloat(plan.totalAmount) || 0;
  const paid = parseFloat(plan.paidAmount) || 0;
  const newPaid = Math.min(total, paid + amount);
  const newStatus = newPaid >= total ? "completed" : "in-progress";

  const [updated] = await db
    .update(treatmentPlans)
    .set({
      paidAmount: String(newPaid),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(treatmentPlans.id, planId))
    .returning();

  await logAudit(s, {
    action: "payment",
    entity: "treatment_plan",
    entityId: planId,
    before: { paidAmount: paid, status: plan.status },
    after: { payment: amount, newPaidAmount: newPaid, status: newStatus },
  });

  revalidatePath("/treatment-plans");
  return { ok: true, data: updated };
}
