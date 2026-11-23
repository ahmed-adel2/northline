import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, inventoryItems } from "@/db";
import { InventoryClient } from "./inventory-client";

export const metadata = { title: "Dental Inventory — Northline Dental Clinic" };

export default async function InventoryPage() {
  await getSession();
  const db = getDb();
  const itemsRows = await db
    .select()
    .from(inventoryItems)
    .orderBy(desc(inventoryItems.createdAt));

  return <InventoryClient initialItems={itemsRows} />;
}
