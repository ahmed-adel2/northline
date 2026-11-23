import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, staffMembers } from "@/db";

export type Role = "owner" | "dentist" | "receptionist";
export type Session = { userId: string; name: string; role: Role; staffId: string | null };

const PERMS: Record<string, Role[]> = {
  "patients:write": ["owner", "dentist", "receptionist"],
  "patients:archive": ["owner"],
  "appointments:write": ["owner", "dentist", "receptionist"],
  "tasks:write": ["owner", "dentist", "receptionist"],
  "settings:write": ["owner"],
  "staff:write": ["owner"],
  "treatment_plans:write": ["owner", "dentist"],
  "clinical:write": ["owner", "dentist"],
  "labs:write": ["owner", "dentist", "receptionist"],
  "invoices:write": ["owner", "receptionist"],
  "inventory:write": ["owner", "dentist", "receptionist"],
  "reports:export": ["owner", "dentist", "receptionist"],
};

export function can(role: Role, perm: keyof typeof PERMS | string) {
  // Clinic owner/admin always has permission to edit and view everything
  if (role === "owner") return true;
  return (PERMS[perm] ?? ["owner"]).includes(role);
}

async function isClerkOrgAdmin(userId: string, orgRole?: string | null) {
  if (orgRole === "org:admin" || orgRole === "admin") return true;
  try {
    const client = await clerkClient();
    const m = await client.users.getOrganizationMembershipList({ userId });
    return m.data.some((x) => x.role === "org:admin" || x.role === "admin");
  } catch {
    return false;
  }
}

/** Resolves the signed-in person to a clinic role, or redirects. Cached per request. */
export const getSession = cache(async (): Promise<Session> => {
  const { userId, orgRole } = await auth();
  if (!userId) redirect("/sign-in");

  const db = getDb();
  const [row] = await db.select().from(staffMembers).where(eq(staffMembers.clerkUserId, userId)).limit(1);
  if (row?.active) return { userId, name: row.fullName, role: row.role, staffId: row.id };

  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress;
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || email || "Owner";

  // If user has an existing staff record matched by email, bind their clerkUserId
  if (!row && email) {
    const [byEmail] = await db.select().from(staffMembers).where(eq(staffMembers.email, email)).limit(1);
    if (byEmail) {
      const [updated] = await db
        .update(staffMembers)
        .set({ clerkUserId: userId, updatedAt: new Date() })
        .where(eq(staffMembers.id, byEmail.id))
        .returning();
      if (updated?.active) {
        return { userId, name: updated.fullName, role: updated.role, staffId: updated.id };
      }
    }
  }

  // Admin / Owner bootstrap:
  // 1. Clerk Org admin
  // 2. User metadata role === 'admin' or 'owner'
  // 3. Or first registered Clerk account in the database (clinic creator)
  const isOrgAdmin = await isClerkOrgAdmin(userId, orgRole);
  const publicMeta = u?.publicMetadata as { role?: string } | undefined;
  const unsafeMeta = u?.unsafeMetadata as { role?: string } | undefined;
  const metaRole = publicMeta?.role || unsafeMeta?.role;
  const isMetaAdmin = metaRole === "admin" || metaRole === "owner";
  
  const [existingClerkUser] = await db
    .select({ id: staffMembers.id })
    .from(staffMembers)
    .where(sql`${staffMembers.clerkUserId} IS NOT NULL`)
    .limit(1);
  const isFirstClerkUser = !existingClerkUser;

  if (isOrgAdmin || isMetaAdmin || isFirstClerkUser || !row) {
    const [created] = await db
      .insert(staffMembers)
      .values({
        clerkUserId: userId,
        fullName: name,
        email: email,
        role: "owner",
        active: true,
      })
      .onConflictDoUpdate({
        target: staffMembers.clerkUserId,
        set: { role: "owner", active: true, updatedAt: new Date() },
      })
      .returning();
    return { userId, name: created?.fullName || name, role: "owner", staffId: created?.id ?? null };
  }

  redirect("/403");
});

export async function requirePerm(perm: string) {
  const s = await getSession();
  if (!can(s.role, perm)) redirect("/403");
  return s;
}
