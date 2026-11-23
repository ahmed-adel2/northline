"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, tasks } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { FormState, isDate, opt, str } from "@/lib/form";

const TYPES = ["Call", "Invoice", "Inventory", "Clinical", "Admin", "Finance", "Lab"] as const;
const PRIOS = ["high", "medium", "low"] as const;

export async function createTask(_: FormState, f: FormData): Promise<FormState> {
  const s = await requirePerm("tasks:write");
  const title = str(f, "title");
  const type = str(f, "type");
  const priority = str(f, "priority");
  const due = opt(f, "dueDate");
  if (title.length < 3) return { ok: false, error: "Give the task a short title." };
  if (!TYPES.includes(type as (typeof TYPES)[number])) return { ok: false, error: "Choose a task type." };
  if (!PRIOS.includes(priority as (typeof PRIOS)[number])) return { ok: false, error: "Choose a priority." };
  if (due && !isDate(due)) return { ok: false, error: "Due date is not valid." };

  const [row] = await getDb().insert(tasks).values({
    title, description: opt(f, "description"), type: type as (typeof TYPES)[number],
    priority: priority as (typeof PRIOS)[number], dueDate: due,
    assignedTo: opt(f, "assignedTo"), patientId: opt(f, "patientId"), createdBy: s.name,
  }).returning();
  await logAudit(s, { action: "create", entity: "task", entityId: row.id, after: row });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setTaskStatus(id: string, status: "open" | "in-progress" | "done") {
  const s = await requirePerm("tasks:write");
  await getDb().update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id));
  await logAudit(s, { action: `status:${status}`, entity: "task", entityId: id });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const s = await requirePerm("tasks:write");
  await getDb().delete(tasks).where(eq(tasks.id, id));
  await logAudit(s, { action: "delete", entity: "task", entityId: id });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
