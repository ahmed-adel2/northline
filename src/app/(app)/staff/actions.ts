"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, staffMembers } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export async function createStaffMember(formData: FormData) {
  const s = await requirePerm("staff:write");
  const fullName = str(formData, "fullName");
  const roleType = str(formData, "roleType"); // 'doctor' | 'support'
  const specialty = opt(formData, "specialty");
  const supportRole = opt(formData, "supportRole");
  const email = opt(formData, "email");
  const phone = opt(formData, "phone");
  const commissionRate = opt(formData, "commissionRate") || "0";

  const db = getDb();
  const [created] = await db
    .insert(staffMembers)
    .values({
      fullName,
      role: roleType === "doctor" ? "dentist" : "receptionist",
      specialty: roleType === "doctor" ? specialty : (supportRole || "Support Staff"),
      email,
      phone,
      commissionRate: roleType === "doctor" ? commissionRate : "0",
      active: true,
      color: "#087f80",
    })
    .returning();

  await logAudit(s, { action: "create", entity: "staff_member", entityId: created.id, after: created });
  revalidatePath("/staff");
  return { ok: true, data: created };
}

export async function toggleStaffStatus(id: string, currentActive: boolean) {
  const s = await requirePerm("staff:write");
  const db = getDb();
  const nextActive = !currentActive;

  const [updated] = await db
    .update(staffMembers)
    .set({
      active: nextActive,
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, id))
    .returning();

  await logAudit(s, {
    action: nextActive ? "activate" : "deactivate",
    entity: "staff_member",
    entityId: id,
    before: { active: currentActive },
    after: { active: nextActive },
  });

  revalidatePath("/staff");
  return { ok: true, data: updated };
}
