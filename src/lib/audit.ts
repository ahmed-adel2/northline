import { auditLogs, getDb } from "@/db";
import type { Session } from "@/lib/auth";

export async function logAudit(
  s: Session,
  e: { action: string; entity: string; entityId?: string; before?: unknown; after?: unknown },
) {
  try {
    await getDb().insert(auditLogs).values({
      actorId: s.userId, actorName: s.name, actorRole: s.role,
      action: e.action, entity: e.entity, entityId: e.entityId,
      before: e.before ?? null, after: e.after ?? null,
    });
  } catch (err) {
    console.error("audit log failed", err); // never block the user action
  }
}
