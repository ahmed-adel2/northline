"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, inventoryItems } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

export async function addInventoryItem(formData: FormData) {
  const s = await requirePerm("inventory:write");
  const name = str(formData, "name");
  const category = str(formData, "category");
  const unit = str(formData, "unit");
  const quantity = parseInt(str(formData, "quantity"), 10) || 0;
  const minQuantity = parseInt(str(formData, "minQuantity"), 10) || 0;
  const unitCost = parseFloat(str(formData, "unitCost")) || 0;
  const supplier = opt(formData, "supplier");

  const sku = `INV-I-${String(Date.now()).slice(-4)}`;
  const status = quantity === 0 ? "out-of-stock" : quantity <= minQuantity ? "low" : "in-stock";
  const lastRestocked = new Date().toISOString().slice(0, 10);

  const db = getDb();
  const [created] = await db
    .insert(inventoryItems)
    .values({
      sku,
      name,
      category,
      unit,
      quantity,
      minQuantity,
      unitCost: String(unitCost),
      supplier,
      lastRestocked,
      status,
      linkedProcedures: ["Clinical Procedure"],
    })
    .returning();

  await logAudit(s, { action: "create", entity: "inventory_item", entityId: created.id, after: created });
  revalidatePath("/inventory");
  return { ok: true, data: created };
}

export async function restockInventoryItem(id: string, addedQuantity: number) {
  const s = await requirePerm("inventory:write");
  if (addedQuantity <= 0) return { ok: false, error: "Invalid restock quantity" };

  const db = getDb();
  const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
  if (!item) return { ok: false, error: "Item not found" };

  const newQty = item.quantity + addedQuantity;
  const newStatus = newQty > item.minQuantity ? "in-stock" : "low";
  const lastRestocked = new Date().toISOString().slice(0, 10);

  const [updated] = await db
    .update(inventoryItems)
    .set({
      quantity: newQty,
      status: newStatus,
      lastRestocked,
      updatedAt: new Date(),
    })
    .where(eq(inventoryItems.id, id))
    .returning();

  await logAudit(s, {
    action: "restock",
    entity: "inventory_item",
    entityId: id,
    before: { quantity: item.quantity, status: item.status },
    after: { added: addedQuantity, newQuantity: newQty, status: newStatus },
  });

  revalidatePath("/inventory");
  return { ok: true, data: updated };
}
