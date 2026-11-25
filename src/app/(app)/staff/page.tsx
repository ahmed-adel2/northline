import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { doctorMonthlySalaries, getDb, staffMembers } from "@/db";
import { StaffClient } from "./staff-client";

export const metadata = { title: "Staff & Doctors — Northline Dental Clinic" };

export default async function StaffPage() {
  await getSession();
  const db = getDb();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [rows, initialSalaries] = await Promise.all([
    db.select().from(staffMembers).orderBy(desc(staffMembers.createdAt)),
    db
      .select()
      .from(doctorMonthlySalaries)
      .where(eq(doctorMonthlySalaries.month, currentMonth)),
  ]);

  return (
    <StaffClient
      initialStaff={rows}
      initialMonth={currentMonth}
      initialSalaries={initialSalaries}
    />
  );
}
