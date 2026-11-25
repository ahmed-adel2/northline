import { and, asc, eq, or } from "drizzle-orm";
import { connection } from "next/server";
import { getDb, staffMembers } from "@/db";
import { TeamClient } from "./team-client";

export const metadata = { title: "Meet Our Team — Northline Dental Clinic" };

export default async function TeamPage() {
  await connection();

  const doctors = await getDb()
    .select({
      id: staffMembers.id,
      fullName: staffMembers.fullName,
      specialty: staffMembers.specialty,
      color: staffMembers.color,
      publicTitle: staffMembers.publicTitle,
      experience: staffMembers.experience,
      availability: staffMembers.availability,
      languages: staffMembers.languages,
      qualifications: staffMembers.qualifications,
      bio: staffMembers.bio,
      philosophy: staffMembers.philosophy,
    })
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.active, true), (eq(staffMembers.role, "dentist")),
      ),
    )
    .orderBy(asc(staffMembers.fullName));

  return <TeamClient doctors={doctors} />;
}
