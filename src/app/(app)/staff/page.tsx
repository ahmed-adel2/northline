import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, staffMembers } from "@/db";
import { StaffClient } from "./staff-client";

export const metadata = { title: "Staff & Doctors — Northline Dental Clinic" };

export default async function StaffPage() {
  await getSession();
  const db = getDb();
  const rows = await db
    .select()
    .from(staffMembers)
    .orderBy(desc(staffMembers.createdAt));

  return <StaffClient initialStaff={rows} />;
}
