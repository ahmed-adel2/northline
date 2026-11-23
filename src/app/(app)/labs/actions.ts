"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, labOrders, patients } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export async function createLabOrder(formData: FormData) {
  const s = await requirePerm("labs:write");
  const patientId = str(formData, "patientId");
  const doctorId = opt(formData, "doctorId");
  const labName = str(formData, "labName");
  const workType = str(formData, "workType");
  const tooth = opt(formData, "tooth");
  const expectedDate = str(formData, "expectedDate");
  const cost = parseFloat(str(formData, "cost")) || 0;
  const notes = opt(formData, "notes");

  const db = getDb();
  let patientName = "Patient";
  if (patientId) {
    const [p] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (p) patientName = p.fullName;
  }

  const orderNo = `LAB-${String(Date.now()).slice(-4)}`;
  const sentDate = new Date().toISOString().slice(0, 10);

  const [created] = await db
    .insert(labOrders)
    .values({
      orderNo,
      patientId: patientId || null,
      patientName,
      doctorId: doctorId || null,
      labName,
      workType,
      tooth,
      sentDate,
      expectedDate,
      status: "sent",
      cost: String(cost),
      notes,
    })
    .returning();

  await logAudit(s, { action: "create", entity: "lab_order", entityId: created.id, after: created });
  revalidatePath("/labs");
  return { ok: true, data: created };
}

export async function advanceLabStatus(orderId: string, nextStatus: string) {
  const s = await requirePerm("labs:write");
  const db = getDb();

  const [order] = await db.select().from(labOrders).where(eq(labOrders.id, orderId)).limit(1);
  if (!order) return { ok: false, error: "Order not found" };

  const receivedDate = nextStatus === "received" ? new Date().toISOString().slice(0, 10) : order.receivedDate;

  const [updated] = await db
    .update(labOrders)
    .set({
      status: nextStatus,
      receivedDate,
      updatedAt: new Date(),
    })
    .where(eq(labOrders.id, orderId))
    .returning();

  await logAudit(s, {
    action: `status:${nextStatus}`,
    entity: "lab_order",
    entityId: orderId,
    before: { status: order.status },
    after: { status: nextStatus, receivedDate },
  });

  revalidatePath("/labs");
  return { ok: true, data: updated };
}
