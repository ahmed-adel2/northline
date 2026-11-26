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

async function isNorthlineOrgAdmin(
  userId: string,
  orgId?: string | null,
  orgSlug?: string | null,
  orgRole?: string | null
): Promise<boolean> {
  const configuredOrgId = process.env.CLERK_NORTHLINE_ORG_ID || process.env.CLERK_ORG_ID;
  const isAdminRole = (role?: string | null) => role === "org:admin" || role === "admin";
  const isNorthlineOrg = (id?: string | null, slug?: string | null, name?: string | null) => {
    if (configuredOrgId) return id === configuredOrgId;
    return Boolean(
      slug?.toLowerCase().includes("northline") || name?.toLowerCase().includes("northline")
    );
  };

  if (orgId && isAdminRole(orgRole) && isNorthlineOrg(orgId, orgSlug, null)) {
    return true;
  }

  try {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({ userId });
    return memberships.data.some(
      (m) =>
        isAdminRole(m.role) &&
        isNorthlineOrg(m.organization.id, m.organization.slug, m.organization.name)
    );
  } catch {
    return false;
  }
}

/** Resolves the signed-in Northline Clerk org admin to a clinic role, or redirects. Cached per request. */
export const getSession = cache(async (): Promise<Session> => {
  const { userId, orgId, orgSlug, orgRole } = await auth();
  if (!userId) redirect("/sign-in");

  const isAdmin = await isNorthlineOrgAdmin(userId, orgId, orgSlug, orgRole);
  if (!isAdmin) redirect("/403");

  const db = getDb();
  const [row] = await db
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.clerkUserId, userId))
    .limit(1);

  if (row) {
    if (!row.active) redirect("/403");
    return { userId, name: row.fullName, role: row.role, staffId: row.id };
  }

  const u = await currentUser();
  const primaryEmail = u?.primaryEmailAddress;
  const email = primaryEmail?.verification?.status === "verified"
    ? primaryEmail.emailAddress.trim().toLowerCase()
    : null;

  // If user has an existing staff record matched by email, bind their clerkUserId
  if (email) {
    const matches = await db
      .select()
      .from(staffMembers)
      .where(sql`lower(${staffMembers.email}) = ${email}`)
      .limit(2);
    if (matches.length === 1) {
      const byEmail = matches[0];
      const [updated] = await db
        .update(staffMembers)
        .set({ clerkUserId: userId, updatedAt: new Date() })
        .where(eq(staffMembers.id, byEmail.id))
        .returning();
      if (!updated?.active) redirect("/403");
      return { userId, name: updated.fullName, role: updated.role, staffId: updated.id };
    }
  }

  redirect("/403");
});

export async function requirePerm(perm: string) {
  const s = await getSession();
  if (!can(s.role, perm)) redirect("/403");
  return s;
}
