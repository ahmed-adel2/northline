"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { clinicSettings, getDb } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str } from "@/lib/form";
import type { OpeningHour } from "@/lib/public-clinic-settings";

const supportedIntegrationNames = new Set(["Google Calendar", "Google Drive", "WhatsApp Business", "Resend (Email)", "Cloudflare R2"]);

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
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function toggleClinicIntegration(name: string, nextStatus: "connected" | "not-connected") {
  const s = await requirePerm("settings:write");
  const db = getDb();
  const [existing] = await db.select().from(clinicSettings).limit(1);
  if (!existing) return { ok: false, error: "Settings not initialized" };

  if (!supportedIntegrationNames.has(name)) throw new Error("Unsupported integration");
  const currentIntegrations = ((existing.integrations as IntegrationItem[]) || []).filter((item) => supportedIntegrationNames.has(item.name));
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
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return { ok: true };
}

export async function updateOpeningHours(openingHours: OpeningHour[]) {
  const session = await requirePerm("settings:write");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (!Array.isArray(openingHours) || openingHours.length !== days.length) {
    throw new Error("Enter opening hours for every day of the week.");
  }

  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const normalizedHours = days.map((day) => {
    const entry = openingHours.find((hour) => hour?.day === day);
    if (!entry || typeof entry.open !== "boolean") {
      throw new Error("Each day must have a valid open or closed setting.");
    }
    if (!entry.open) return { day, from: "", to: "", open: false };
    if (
      typeof entry.from !== "string" ||
      typeof entry.to !== "string" ||
      !timePattern.test(entry.from) ||
      !timePattern.test(entry.to) ||
      entry.from >= entry.to
    ) {
      throw new Error("Choose a valid opening and closing time for each open day.");
    }
    return { day, from: entry.from, to: entry.to, open: true };
  });

  const db = getDb();
  const [existing] = await db.select().from(clinicSettings).limit(1);
  let updated;
  if (existing) {
    [updated] = await db
      .update(clinicSettings)
      .set({ openingHours: normalizedHours, updatedAt: new Date() })
      .where(eq(clinicSettings.id, existing.id))
      .returning();
    await logAudit(session, {
      action: "update",
      entity: "settings",
      entityId: existing.id,
      before: { openingHours: existing.openingHours },
      after: { openingHours: updated.openingHours },
    });
  } else {
    [updated] = await db
      .insert(clinicSettings)
      .values({ openingHours: normalizedHours })
      .returning();
    await logAudit(session, {
      action: "create",
      entity: "settings",
      entityId: updated.id,
      after: { openingHours: normalizedHours },
    });
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setPublicPricelistAvailability(enabled: boolean) {
  const session = await requirePerm("settings:write");
  if (typeof enabled !== "boolean") throw new Error("Choose whether the public pricelist is available.");

  const db = getDb();
  const [existing] = await db.select().from(clinicSettings).limit(1);
  let updated;
  if (existing) {
    [updated] = await db
      .update(clinicSettings)
      .set({ publicPricelist: enabled, updatedAt: new Date() })
      .where(eq(clinicSettings.id, existing.id))
      .returning();
    await logAudit(session, {
      action: "settings:public-pricelist",
      entity: "settings",
      entityId: existing.id,
      before: { publicPricelist: existing.publicPricelist },
      after: { publicPricelist: enabled },
    });
  } else {
    [updated] = await db
      .insert(clinicSettings)
      .values({ publicPricelist: enabled })
      .returning();
    await logAudit(session, {
      action: "settings:public-pricelist",
      entity: "settings",
      entityId: updated.id,
      after: { publicPricelist: enabled },
    });
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  return { ok: true, enabled };
}