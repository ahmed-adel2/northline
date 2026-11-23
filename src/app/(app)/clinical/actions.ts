"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, toothFindings } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";

export async function saveToothCondition(
  patientId: string,
  tooth: number,
  status: string,
  notes?: string
) {
  const s = await requirePerm("clinical:write");
  const db = getDb();

  const [existing] = await db
    .select()
    .from(toothFindings)
    .where(and(eq(toothFindings.patientId, patientId), eq(toothFindings.tooth, tooth)))
    .limit(1);

  let result;
  if (existing) {
    [result] = await db
      .update(toothFindings)
      .set({
        status,
        notes: notes || existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(toothFindings.id, existing.id))
      .returning();

    await logAudit(s, {
      action: "update_tooth_status",
      entity: "tooth_finding",
      entityId: existing.id,
      before: { tooth, status: existing.status },
      after: { tooth, status, notes },
    });
  } else {
    [result] = await db
      .insert(toothFindings)
      .values({
        patientId,
        tooth,
        status,
        notes: notes || `Finding noted on ${new Date().toISOString().slice(0, 10)}`,
      })
      .returning();

    await logAudit(s, {
      action: "create_tooth_finding",
      entity: "tooth_finding",
      entityId: result.id,
      after: { patientId, tooth, status, notes },
    });
  }

  revalidatePath("/clinical");
  return { ok: true, data: result };
}
