import {
    boolean, date, integer, jsonb, numeric, pgEnum, pgTable, text,
    time, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

/* Every table has RLS enabled with NO policies: the Supabase REST API (anon /
   authenticated keys) can read nothing. Only server code using DATABASE_URL
   (the `postgres` role, which bypasses RLS) can reach the data. */

export const roleEnum = pgEnum("staff_role", ["owner", "dentist", "receptionist"]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const patientStatusEnum = pgEnum("patient_status", ["active", "overdue", "inactive"]);
export const apptStatusEnum = pgEnum("appointment_status", [
    "scheduled", "confirmed", "checked-in", "in-progress", "completed", "no-show", "cancelled",
]);
export const taskPriorityEnum = pgEnum("task_priority", ["high", "medium", "low"]);
export const taskStatusEnum = pgEnum("task_status", ["open", "in-progress", "done"]);
export const taskTypeEnum = pgEnum("task_type", [
    "Call", "Invoice", "Inventory", "Clinical", "Admin", "Finance", "Lab",
]);

const stamps = {
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const branches = pgTable("branches", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    address: text("address"),
    phone: text("phone"),
    isMain: boolean("is_main").notNull().default(false),
    ...stamps,
}).enableRLS();

export const staffMembers = pgTable("staff_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").unique(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    role: roleEnum("role").notNull().default("receptionist"),
    specialty: text("specialty"),
    publicTitle: text("public_title"),
    experience: text("experience"),
    availability: text("availability"),
    languages: text("languages").array().notNull().default([]),
    qualifications: text("qualifications").array().notNull().default([]),
    bio: text("bio"),
    philosophy: text("philosophy"),
    color: text("color").default("#087f80"),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"),
    branchId: uuid("branch_id").references(() => branches.id),
    active: boolean("active").notNull().default(true),
    ...stamps,
}).enableRLS();

export const patients = pgTable("patients", {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Human code is "P-" + zero-padded number, e.g. P-001 */
    patientNo: integer("patient_no").notNull().unique().generatedByDefaultAsIdentity(),
    fullName: text("full_name").notNull(),
    dob: date("dob"),
    gender: genderEnum("gender"),
    phone: text("phone").notNull(),
    email: text("email"),
    nationalId: text("national_id"),
    address: text("address"),
    bloodType: text("blood_type"),
    allergies: text("allergies").array().notNull().default([]),
    insuranceProvider: text("insurance_provider"),
    insuranceMemberId: text("insurance_member_id"),
    notes: text("notes"),
    status: patientStatusEnum("status").notNull().default("active"),
    loyaltyPoints: integer("loyalty_points").notNull().default(0),
    referredByPatientId: uuid("referred_by_patient_id"),
    branchId: uuid("branch_id").references(() => branches.id),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...stamps,
}).enableRLS();

export const appointments = pgTable("appointments", {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id").notNull().references(() => patients.id),
    doctorId: uuid("doctor_id").references(() => staffMembers.id),
    branchId: uuid("branch_id").references(() => branches.id),
    /** Clinic-local wall-clock values: no timezone maths needed. */
    apptDate: date("appt_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    procedure: text("procedure").notNull(),
    room: text("room"),
    status: apptStatusEnum("status").notNull().default("scheduled"),
    notes: text("notes"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    ...stamps,
}).enableRLS();

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    type: taskTypeEnum("type").notNull().default("Admin"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    status: taskStatusEnum("status").notNull().default("open"),
    assignedTo: text("assigned_to"),
    patientId: uuid("patient_id").references(() => patients.id),
    dueDate: date("due_date"),
    createdBy: text("created_by"),
    ...stamps,
}).enableRLS();

export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").notNull(),
    actorName: text("actor_name"),
    actorRole: text("actor_role"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

/* =========================================================================
   EXTENDED ENTERPRISE CLINIC TABLES (Invoices, Treatment, Inventory, Labs, Claims, Odontogram)
   ========================================================================= */

export const invoices = pgTable("invoices", {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNo: text("invoice_no").notNull(),
    patientId: uuid("patient_id").references(() => patients.id),
    patientName: text("patient_name").notNull(),
    appointmentId: uuid("appointment_id").references(() => appointments.id),
    status: text("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    items: jsonb("items").notNull().default([]),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    paid: numeric("paid", { precision: 12, scale: 2 }).notNull().default("0"),
    balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
    paymentMethod: text("payment_method"),
    insurance: text("insurance"),
    insuranceClaim: text("insurance_claim"),
    notes: text("notes"),
    ...stamps,
}).enableRLS();

export const treatmentPlans = pgTable("treatment_plans", {
    id: uuid("id").primaryKey().defaultRandom(),
    planNo: text("plan_no").notNull(),
    patientId: uuid("patient_id").references(() => patients.id),
    patientName: text("patient_name").notNull(),
    doctorId: uuid("doctor_id").references(() => staffMembers.id),
    doctorName: text("doctor_name"),
    status: text("status").notNull().default("draft"),
    createdDate: date("created_date").notNull(),
    approvedDate: date("approved_date"),
    items: jsonb("items").notNull().default([]),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    ...stamps,
}).enableRLS();

export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    unit: text("unit").notNull(),
    quantity: integer("quantity").notNull().default(0),
    minQuantity: integer("min_quantity").notNull().default(0),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull().default("0"),
    supplier: text("supplier"),
    lastRestocked: date("last_restocked"),
    status: text("status").notNull().default("in-stock"),
    linkedProcedures: text("linked_procedures").array().notNull().default([]),
    ...stamps,
}).enableRLS();

export const labOrders = pgTable("lab_orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNo: text("order_no").notNull(),
    patientId: uuid("patient_id").references(() => patients.id),
    patientName: text("patient_name").notNull(),
    doctorId: uuid("doctor_id").references(() => staffMembers.id),
    labName: text("lab_name").notNull(),
    workType: text("work_type").notNull(),
    tooth: text("tooth"),
    sentDate: date("sent_date").notNull(),
    expectedDate: date("expected_date").notNull(),
    receivedDate: date("received_date"),
    status: text("status").notNull().default("sent"),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    ...stamps,
}).enableRLS();

export const insuranceClaims = pgTable("insurance_claims", {
    id: uuid("id").primaryKey().defaultRandom(),
    claimNo: text("claim_no").notNull(),
    invoiceId: text("invoice_id"),
    patientId: uuid("patient_id").references(() => patients.id),
    patientName: text("patient_name").notNull(),
    insurance: text("insurance").notNull(),
    memberId: text("member_id"),
    submittedDate: date("submitted_date"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
    status: text("status").notNull().default("submitted"),
    rejectionReason: text("rejection_reason"),
    notes: text("notes"),
    ...stamps,
}).enableRLS();

export const toothFindings = pgTable("tooth_findings", {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: text("patient_id").notNull(),
    tooth: integer("tooth").notNull(),
    status: text("status").notNull().default("healthy"),
    notes: text("notes"),
    ...stamps,
}).enableRLS();

export const clinicSettings = pgTable("clinic_settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicName: text("clinic_name").notNull().default("Northline Dental Clinic"),
    branchName: text("branch_name").default("Main Branch"),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    taxId: text("tax_id"),
    publicPricelist: boolean("public_pricelist").default(true),
    loyaltyEnabled: boolean("loyalty_enabled").notNull().default(true),
    openingHours: jsonb("opening_hours"),
    integrations: jsonb("integrations"),
    ...stamps,
}).enableRLS();

export const doctorMonthlySalaries = pgTable(
    "doctor_monthly_salaries",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        doctorId: uuid("doctor_id").notNull().references(() => staffMembers.id),
        /** Format: YYYY-MM, e.g. "2026-11" */
        month: text("month").notNull(),
        grossRevenue: numeric("gross_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
        commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("0"),
        salaryAmount: numeric("salary_amount", { precision: 12, scale: 2 }).notNull().default("0"),
        appointmentsCount: integer("appointments_count").notNull().default(0),
        calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
        ...stamps,
    },
    (t) => [uniqueIndex("doctor_monthly_salaries_doctor_month_idx").on(t.doctorId, t.month)]
).enableRLS();

export const patientArrivals = pgTable("patient_arrivals", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    memberName: text("member_name").notNull(),
    email: text("email"),
    username: text("username"),
    phone: text("phone"),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }).notNull().defaultNow(),
    patientId: uuid("patient_id").references(() => patients.id),
    ...stamps,
}).enableRLS();

export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Staff = typeof staffMembers.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type LabOrder = typeof labOrders.$inferSelect;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type ToothFinding = typeof toothFindings.$inferSelect;
export type ClinicSettings = typeof clinicSettings.$inferSelect;
export type PatientArrival = typeof patientArrivals.$inferSelect;
export type DoctorMonthlySalary = typeof doctorMonthlySalaries.$inferSelect;
