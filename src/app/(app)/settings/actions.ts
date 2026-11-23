"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { clinicSettings, getDb } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str } from "@/lib/form";

interface IntegrationItem {
  name: string;
  status: "connected" | "not-connected";
  icon: string;
  description: string;
}

export async function updateClinicSettings(formData: FormData) {
  const s = await requirePerm("settings:write");
  const clinicName = str(formData, "clinicName");
  const branchName = str(formData, "branchName");
  const address = str(formData, "address");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const taxId = str(formData, "taxId");

  const db = getDb();
  const [existing] = await db.select().from(clinicSettings).limit(1);

  let updated;
  if (existing) {
    [updated] = await db
      .update(clinicSettings)
      .set({
        clinicName,
        branchName,
        address,
        phone,
        email,
        taxId,
        updatedAt: new Date(),
      })
      .where(eq(clinicSettings.id, existing.id))
      .returning();
    await logAudit(s, { action: "update", entity: "settings", entityId: existing.id, before: existing, after: updated });
  } else {
    [updated] = await db
      .insert(clinicSettings)
      .values({
        clinicName,
        branchName,
        address,
        phone,
        email,
        taxId,
      })
      .returning();
    await logAudit(s, { action: "create", entity: "settings", entityId: updated.id, after: updated });
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function toggleClinicIntegration(name: string, nextStatus: "connected" | "not-connected") {
  const s = await requirePerm("settings:write");
  const db = getDb();
  const [existing] = await db.select().from(clinicSettings).limit(1);
  if (!existing) return { ok: false, error: "Settings not initialized" };

  const currentIntegrations = (existing.integrations as IntegrationItem[]) || [];
  const updatedIntegrations = currentIntegrations.map((item) =>
    item.name === name ? { ...item, status: nextStatus } : item
  );

  await db
    .update(clinicSettings)
    .set({
      integrations: updatedIntegrations,
      updatedAt: new Date(),
    })
    .where(eq(clinicSettings.id, existing.id));

  await logAudit(s, {
    action: `integration:${name}:${nextStatus}`,
    entity: "settings",
    entityId: existing.id,
    before: { name, status: nextStatus === "connected" ? "not-connected" : "connected" },
    after: { name, status: nextStatus },
  });

  revalidatePath("/settings");
  return { ok: true };
}
