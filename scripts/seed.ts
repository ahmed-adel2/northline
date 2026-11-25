/* Seeds the synthetic demo clinic and all extended clinic tables. Every row is flagged is_demo=true.
   Run:  pnpm db:seed      Remove later:  pnpm db:wipe-demo */
try { process.loadEnvFile(".env.local"); } catch { /* env already set */ }

import postgres from "postgres";
import {
  demoAppointments,
  demoDoctors,
  demoPatients,
  demoTasks,
  demoTreatmentPlans,
  demoInvoices,
  demoInventory,
  demoLabOrders,
  demoClaims,
} from "../src/lib/demo-data";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local");
const sql = postgres(url, { prepare: false, max: 1 });
const no = (code: string) => Number(code.replace(/\D/g, ""));
const PRIORITY = { high: "high", medium: "medium", low: "low" } as const;

async function main() {
  console.log("Checking existing data...");
  const [{ patCount }] = await sql`select count(*)::int as "patCount" from patients where is_demo`;

  let branchId: string;
  const existingBranch = await sql`select id from branches where is_main limit 1`;
  if (existingBranch.length > 0) {
    branchId = existingBranch[0].id;
  } else {
    const [branch] = await sql`insert into branches (name, address, is_main, is_demo)
      values ('Main Branch', '1 Tahrir Square, Downtown, Cairo, Egypt', true, true) returning id`;
    branchId = branch.id;
  }

  const docIds = new Map<string, string>();
  for (const d of demoDoctors) {
    const existing = await sql`select id from staff_members where full_name = ${d.name} limit 1`;
    if (existing.length > 0) {
      docIds.set(d.id, existing[0].id);
    } else {
      const [r] = await sql`insert into staff_members (full_name, email, phone, role, specialty, color, commission_rate, branch_id, active, is_demo)
        values (${d.name}, ${d.email}, ${d.phone}, 'dentist', ${d.specialty}, ${d.color}, ${d.commissionRate}, ${branchId}, ${d.status === "active"}, true) returning id`;
      docIds.set(d.id, r.id);
    }
  }

  // Also ensure support staff are in staff_members if not present
  const supportStaff = [
    { name: "Mariam Fouad", role: "receptionist", email: "mariam.f@northline.clinic", phone: "+20 100 777 8888" },
    { name: "Dalia Youssef", role: "receptionist", email: "dalia.y@northline.clinic", phone: "+20 100 666 7777" },
  ];
  for (const s of supportStaff) {
    const existing = await sql`select id from staff_members where full_name = ${s.name} limit 1`;
    if (existing.length === 0) {
      await sql`insert into staff_members (full_name, email, phone, role, branch_id, active, is_demo)
        values (${s.name}, ${s.email}, ${s.phone}, ${s.role}, ${branchId}, true, true)`;
    }
  }

  const patIds = new Map<string, string>();
  if (patCount === 0) {
    for (const p of demoPatients) {
      const [r] = await sql`insert into patients (patient_no, full_name, dob, gender, phone, email, national_id, address, blood_type, allergies,
          insurance_provider, insurance_member_id, notes, status, loyalty_points, branch_id, is_demo)
        values (${no(p.id)}, ${p.name}, ${p.dob}, ${p.gender}, ${p.phone}, ${p.email}, ${p.nationalId}, ${p.address}, ${p.bloodType}, ${p.allergies},
          ${p.insurance ?? null}, ${p.insuranceMemberId ?? null}, ${p.notes}, ${p.status}, ${p.loyaltyPoints}, ${branchId}, true) returning id`;
      patIds.set(p.id, r.id);
    }
    await sql`select setval(pg_get_serial_sequence('patients','patient_no'), (select coalesce(max(patient_no), 1) from patients))`;

    for (const a of demoAppointments) {
      await sql`insert into appointments (patient_id, doctor_id, branch_id, appt_date, start_time, end_time, procedure, room, status, notes, amount, is_demo)
        values (${patIds.get(a.patientId)!}, ${docIds.get(a.doctorId) ?? null}, ${branchId}, ${a.date}, ${a.startTime}, ${a.endTime}, ${a.procedure},
          ${a.room}, ${a.status}, ${a.notes ?? null}, ${a.amount}, true)`;
    }
    for (const t of demoTasks) {
      await sql`insert into tasks (title, description, type, priority, status, assigned_to, patient_id, due_date, created_by, is_demo)
        values (${t.title}, ${t.description}, ${t.type}, ${PRIORITY[t.priority]}, ${t.status}, ${t.assignedTo},
          ${t.patientId ? patIds.get(t.patientId) ?? null : null}, ${t.due}, 'seed', true)`;
    }
  } else {
    // Populate patIds from existing patients
    const existingPats = await sql`select id, patient_no from patients`;
    for (const p of existingPats) {
      const code = `P-${String(p.patient_no).padStart(3, "0")}`;
      patIds.set(code, p.id);
    }
  }

  // 1. Clinic Settings
  const existingSettings = await sql`select id from clinic_settings limit 1`;
  if (existingSettings.length === 0) {
    const openingHours = [
      { day: "Sunday", from: "08:00", to: "17:00", open: true },
      { day: "Monday", from: "08:00", to: "17:00", open: true },
      { day: "Tuesday", from: "08:00", to: "17:00", open: true },
      { day: "Wednesday", from: "08:00", to: "17:00", open: true },
      { day: "Thursday", from: "08:00", to: "14:00", open: true },
      { day: "Friday", from: "—", to: "—", open: false },
      { day: "Saturday", from: "09:00", to: "13:00", open: true },
    ];
    const integrations = [
      { name: "Google Calendar", status: "connected", icon: "📅", description: "Two-way sync per doctor." },
      { name: "Google Drive", status: "connected", icon: "☁️", description: "Automatic daily backup." },
      { name: "WhatsApp Business", status: "not-connected", icon: "💬", description: "Automated appointment reminders and recalls (requires Cloud API access)." },
      { name: "Resend (Email)", status: "connected", icon: "✉️", description: "Transactional emails and recall campaigns." },
      { name: "Cloudflare R2", status: "connected", icon: "📁", description: "Patient file and image storage." },
    ];
    await sql`insert into clinic_settings (clinic_name, branch_name, address, phone, email, tax_id, public_pricelist, opening_hours, integrations, is_demo)
      values ('Northline Dental Clinic', 'Main Branch', '1 Tahrir Square, Downtown, Cairo, Egypt', '+20 2 2222 3333', 'hello@northline.clinic', '310122393500003', true, ${sql.json(openingHours)}, ${sql.json(integrations)}, true)`;
    console.log("Seeded clinic_settings.");
  }

  // 2. Treatment Plans
  const [{ tpCount }] = await sql`select count(*)::int as "tpCount" from treatment_plans`;
  if (tpCount === 0) {
    for (const tp of demoTreatmentPlans) {
      const patientUuid = patIds.get(tp.patientId) ?? null;
      const docUuid = docIds.get(tp.doctorId) ?? null;
      await sql`insert into treatment_plans (plan_no, patient_id, patient_name, doctor_id, doctor_name, status, created_date, approved_date, items, total_amount, paid_amount, notes, is_demo)
        values (${tp.id}, ${patientUuid}, ${tp.patientName}, ${docUuid}, ${tp.doctorName}, ${tp.status}, ${tp.createdDate}, ${tp.approvedDate ?? null}, ${sql.json(tp.items)}, ${tp.totalAmount}, ${tp.paidAmount}, ${tp.notes}, true)`;
    }
    console.log(`Seeded ${demoTreatmentPlans.length} treatment_plans.`);
  }

  // 3. Invoices
  const [{ invCount }] = await sql`select count(*)::int as "invCount" from invoices`;
  if (invCount === 0) {
    for (const inv of demoInvoices) {
      const patientUuid = patIds.get(inv.patientId) ?? null;
      await sql`insert into invoices (invoice_no, patient_id, patient_name, status, issue_date, due_date, items, subtotal, discount, tax, total, paid, balance, payment_method, insurance, insurance_claim, notes, is_demo)
        values (${inv.id}, ${patientUuid}, ${inv.patientName}, ${inv.status}, ${inv.issueDate}, ${inv.dueDate}, ${sql.json(inv.items)}, ${inv.subtotal}, ${inv.discount}, ${inv.tax}, ${inv.total}, ${inv.paid}, ${inv.balance}, ${inv.paymentMethod ?? null}, ${inv.insurance ?? null}, ${inv.insuranceClaim ?? null}, ${inv.notes ?? null}, true)`;
    }
    console.log(`Seeded ${demoInvoices.length} invoices.`);
  }

  // 4. Inventory Items
  const [{ invItemCount }] = await sql`select count(*)::int as "invItemCount" from inventory_items`;
  if (invItemCount === 0) {
    for (const item of demoInventory) {
      await sql`insert into inventory_items (sku, name, category, unit, quantity, min_quantity, unit_cost, supplier, last_restocked, status, linked_procedures, is_demo)
        values (${item.id}, ${item.name}, ${item.category}, ${item.unit}, ${item.quantity}, ${item.minQuantity}, ${item.unitCost}, ${item.supplier}, ${item.lastRestocked}, ${item.status}, ${item.linkedProcedures}, true)`;
    }
    console.log(`Seeded ${demoInventory.length} inventory_items.`);
  }

  // 5. Lab Orders
  const [{ labCount }] = await sql`select count(*)::int as "labCount" from lab_orders`;
  if (labCount === 0) {
    for (const lab of demoLabOrders) {
      const patientUuid = patIds.get(lab.patientId) ?? null;
      const docUuid = docIds.get(lab.doctorId) ?? null;
      await sql`insert into lab_orders (order_no, patient_id, patient_name, doctor_id, lab_name, work_type, tooth, sent_date, expected_date, received_date, status, cost, notes, is_demo)
        values (${lab.id}, ${patientUuid}, ${lab.patientName}, ${docUuid}, ${lab.labName}, ${lab.workType}, ${lab.tooth}, ${lab.sentDate}, ${lab.expectedDate}, ${lab.receivedDate ?? null}, ${lab.status}, ${lab.cost}, ${lab.notes ?? null}, true)`;
    }
    console.log(`Seeded ${demoLabOrders.length} lab_orders.`);
  }

  // 6. Insurance Claims
  const [{ claimCount }] = await sql`select count(*)::int as "claimCount" from insurance_claims`;
  if (claimCount === 0) {
    for (const clm of demoClaims) {
      const patientUuid = patIds.get(clm.patientId) ?? null;
      await sql`insert into insurance_claims (claim_no, invoice_id, patient_id, patient_name, insurance, member_id, submitted_date, amount, approved_amount, status, notes, is_demo)
        values (${clm.id}, ${clm.invoiceId}, ${patientUuid}, ${clm.patientName}, ${clm.insurance}, ${clm.memberId ?? null}, ${clm.submittedDate || null}, ${clm.amount}, ${clm.approvedAmount ?? null}, ${clm.status}, ${clm.notes ?? null}, true)`;
    }
    console.log(`Seeded ${demoClaims.length} insurance_claims.`);
  }

  // 7. Tooth Findings (Odontogram)
  const [{ toothCount }] = await sql`select count(*)::int as "toothCount" from tooth_findings`;
  if (toothCount === 0) {
    const findings = [
      { patientId: "P-003", tooth: 16, status: "crown", notes: "Zirconia full contour crown" },
      { patientId: "P-003", tooth: 26, status: "rct", notes: "Obturation complete" },
      { patientId: "P-003", tooth: 14, status: "decay", notes: "Occlusal caries" },
      { patientId: "P-006", tooth: 11, status: "implant", notes: "Straumann fixture" },
      { patientId: "P-001", tooth: 36, status: "filled", notes: "Composite restoration" },
      { patientId: "P-002", tooth: 46, status: "missing", notes: "Extracted" },
    ];
    for (const f of findings) {
      await sql`insert into tooth_findings (patient_id, tooth, status, notes, is_demo)
        values (${f.patientId}, ${f.tooth}, ${f.status}, ${f.notes}, true)`;
    }
    console.log(`Seeded ${findings.length} tooth_findings.`);
  }

  // 8. Reload PostgREST schema cache and ensure table grants for Supabase Data API
  try {
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("Notified PostgREST to reload schema cache.");
  } catch (e) {
    console.warn("Could not notify pgrst:", e);
  }

  console.log("Seeding complete! All tables in public schema now populated.");
}

main().catch(console.error).finally(() => sql.end());
