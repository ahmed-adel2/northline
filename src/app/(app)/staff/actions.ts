"use server";

import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appointments, doctorMonthlySalaries, getDb, staffMembers } from "@/db";
import { logAudit } from "@/lib/audit";
import { requirePerm } from "@/lib/auth";
import { str, opt } from "@/lib/form";

const lines = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string"
    ? value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
};

export async function createStaffMember(formData: FormData) {
  const s = await requirePerm("staff:write");
  const fullName = str(formData, "fullName");
  const roleType = str(formData, "roleType"); // 'doctor' | 'support'
  const specialty = opt(formData, "specialty");
  const supportRole = opt(formData, "supportRole");
  const email = opt(formData, "email");
  const phone = opt(formData, "phone");
  const commissionRate = opt(formData, "commissionRate") || "0";

  const db = getDb();
  const [created] = await db
    .insert(staffMembers)
    .values({
      fullName,
      role: roleType === "doctor" ? "dentist" : "receptionist",
      specialty: roleType === "doctor" ? specialty : (supportRole || "Support Staff"),
      publicTitle: roleType === "doctor" ? opt(formData, "publicTitle") : null,
      experience: roleType === "doctor" ? opt(formData, "experience") : null,
      availability: roleType === "doctor" ? opt(formData, "availability") : null,
      languages: roleType === "doctor" ? lines(formData, "languages") : [],
      qualifications: roleType === "doctor" ? lines(formData, "qualifications") : [],
      bio: roleType === "doctor" ? opt(formData, "bio") : null,
      philosophy: roleType === "doctor" ? opt(formData, "philosophy") : null,
      email,
      phone,
      commissionRate: roleType === "doctor" ? commissionRate : "0",
      active: true,
      color: "#087f80",
    })
    .returning();

  await logAudit(s, { action: "create", entity: "staff_member", entityId: created.id, after: created });
  revalidatePath("/staff");
  revalidatePath("/team");
  return { ok: true, data: created };
}

export async function updateDoctorProfile(id: string, formData: FormData) {
  const s = await requirePerm("staff:write");
  const db = getDb();
  const [before] = await db.select().from(staffMembers).where(eq(staffMembers.id, id)).limit(1);

  if (!before || (before.role !== "dentist" && before.role !== "owner")) {
    throw new Error("Doctor profile not found.");
  }

  const [updated] = await db
    .update(staffMembers)
    .set({
      fullName: str(formData, "fullName"),
      specialty: opt(formData, "specialty"),
      publicTitle: opt(formData, "publicTitle"),
      experience: opt(formData, "experience"),
      availability: opt(formData, "availability"),
      languages: lines(formData, "languages"),
      qualifications: lines(formData, "qualifications"),
      bio: opt(formData, "bio"),
      philosophy: opt(formData, "philosophy"),
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, id))
    .returning();

  if (!updated) {
    throw new Error("Doctor profile could not be updated.");
  }

  await logAudit(s, {
    action: "update",
    entity: "staff_member",
    entityId: id,
    before,
    after: updated,
  });
  revalidatePath("/staff");
  revalidatePath("/team");
  return { ok: true, data: updated };
}

export async function updateStaffProfile(id: string, formData: FormData) {
  const s = await requirePerm("staff:write");
  const db = getDb();
  const [before] = await db.select().from(staffMembers).where(eq(staffMembers.id, id)).limit(1);

  if (!before) {
    throw new Error("Staff member not found.");
  }

  const isDoctor = before.role === "dentist" || before.role === "owner";

  const [updated] = await db
    .update(staffMembers)
    .set(
      isDoctor
        ? {
            fullName: str(formData, "fullName"),
            specialty: opt(formData, "specialty"),
            publicTitle: opt(formData, "publicTitle"),
            experience: opt(formData, "experience"),
            availability: opt(formData, "availability"),
            languages: lines(formData, "languages"),
            qualifications: lines(formData, "qualifications"),
            bio: opt(formData, "bio"),
            philosophy: opt(formData, "philosophy"),
            email: opt(formData, "email"),
            phone: opt(formData, "phone"),
            updatedAt: new Date(),
          }
        : {
            fullName: str(formData, "fullName"),
            specialty: opt(formData, "supportRole") || opt(formData, "specialty") || "Support Staff",
            email: opt(formData, "email"),
            phone: opt(formData, "phone"),
            updatedAt: new Date(),
          }
    )
    .where(eq(staffMembers.id, id))
    .returning();

  if (!updated) {
    throw new Error("Staff profile could not be updated.");
  }

  await logAudit(s, {
    action: "update",
    entity: "staff_member",
    entityId: id,
    before,
    after: updated,
  });
  revalidatePath("/staff");
  revalidatePath("/team");
  return { ok: true, data: updated };
}

export async function toggleStaffStatus(id: string, currentActive: boolean) {
  const s = await requirePerm("staff:write");
  const db = getDb();
  const nextActive = !currentActive;

  const [updated] = await db
    .update(staffMembers)
    .set({
      active: nextActive,
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, id))
    .returning();

  await logAudit(s, {
    action: nextActive ? "activate" : "deactivate",
    entity: "staff_member",
    entityId: id,
    before: { active: currentActive },
    after: { active: nextActive },
  });

  revalidatePath("/staff");
  revalidatePath("/team");
  return { ok: true, data: updated };
}

function getMonthBounds(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Invalid month format. Expected YYYY-MM.");
  }
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const mon = Number(monthStr);
  if (mon < 1 || mon > 12) {
    throw new Error("Invalid month value.");
  }
  const startDate = `${yearStr}-${monthStr}-01`;
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMonth = mon === 12 ? 1 : mon + 1;
  const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { startDate, nextMonthStart };
}

export async function getMonthlyDoctorSalaries(month: string) {
  await requirePerm("staff:read");
  getMonthBounds(month);
  const db = getDb();
  const rows = await db
    .select()
    .from(doctorMonthlySalaries)
    .where(eq(doctorMonthlySalaries.month, month));
  return { ok: true, data: rows };
}

export async function calculateMonthlyDoctorSalaries(month: string) {
  const s = await requirePerm("staff:write");
  const { startDate, nextMonthStart } = getMonthBounds(month);
  const db = getDb();

  const doctors = await db
    .select()
    .from(staffMembers)
    .where(inArray(staffMembers.role, ["dentist", "owner"]));

  const revenueRows = await db
    .select({
      doctorId: appointments.doctorId,
      grossRevenue: sql<string>`COALESCE(SUM(${appointments.amount}), 0)::numeric(12,2)::text`,
      appointmentsCount: sql<number>`COUNT(*)::int`,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.status, "completed"),
        gte(appointments.apptDate, startDate),
        lt(appointments.apptDate, nextMonthStart)
      )
    )
    .groupBy(appointments.doctorId);

  const revenueByDoctor = new Map(
    revenueRows
      .filter((r) => r.doctorId !== null)
      .map((r) => [r.doctorId as string, r])
  );

  const now = new Date();
  const savedRows = [];

  for (const doc of doctors) {
    const rev = revenueByDoctor.get(doc.id);
    const grossRevenueNum = Number(rev?.grossRevenue ?? 0);
    const commissionRateNum = Number(doc.commissionRate ?? 0);
    const salaryAmount = ((grossRevenueNum * commissionRateNum) / 100).toFixed(2);
    const grossRevenue = grossRevenueNum.toFixed(2);
    const commissionRate = commissionRateNum.toFixed(2);
    const appointmentsCount = rev?.appointmentsCount ?? 0;

    const [saved] = await db
      .insert(doctorMonthlySalaries)
      .values({
        doctorId: doc.id,
        month,
        grossRevenue,
        commissionRate,
        salaryAmount,
        appointmentsCount,
        calculatedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [doctorMonthlySalaries.doctorId, doctorMonthlySalaries.month],
        set: {
          grossRevenue,
          commissionRate,
          salaryAmount,
          appointmentsCount,
          calculatedAt: now,
          updatedAt: now,
        },
      })
      .returning();

    savedRows.push(saved);
  }

  await logAudit(s, {
    action: "calculate_monthly_salaries",
    entity: "doctor_monthly_salaries",
    entityId: month,
    after: { month, count: savedRows.length },
  });

  revalidatePath("/staff");
  return { ok: true, data: savedRows };
}
