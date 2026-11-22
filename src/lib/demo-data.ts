/**
 * Comprehensive synthetic demo data for DentoRash — Northline Dental Clinic.
 * All records are fictional and flagged as demo. Wiped on real-clinic provisioning.
 */

// ─── Patients ──────────────────────────────────────────────────────────────────

export type PatientStatus = "active" | "overdue" | "inactive";
export type Gender = "male" | "female";

export interface DemoPatient {
  id: string;
  name: string;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  nationalId: string;
  address: string;
  bloodType: string;
  allergies: string[];
  insurance?: string;
  insuranceMemberId?: string;
  lastVisit: string;
  nextAppt: string | null;
  status: PatientStatus;
  balance: number; // EGP, negative = owes
  loyaltyPoints: number;
  referredBy?: string;
  notes: string;
}

export const demoPatients: DemoPatient[] = [
  {
    id: "P-001",
    name: "Omar Al-Farsi",
    dob: "1984-03-12",
    gender: "male",
    phone: "+20 100 123 4567",
    email: "omar.alfarsi@email.com",
    nationalId: "28403124512345",
    address: "15 Tahrir St., Dokki, Giza",
    bloodType: "O+",
    allergies: ["Penicillin"],
    insurance: "Misr Insurance",
    insuranceMemberId: "MI-10045221",
    lastVisit: "2026-11-20",
    nextAppt: "2026-11-25",
    status: "active",
    balance: -450,
    loyaltyPoints: 320,
    referredBy: "P-004",
    notes: "Patient prefers morning appointments. Sensitive gag reflex.",
  },
  {
    id: "P-002",
    name: "Layla Mahmoud",
    dob: "1991-07-08",
    gender: "female",
    phone: "+20 111 987 6543",
    email: "layla.m@email.com",
    nationalId: "29107085123456",
    address: "7 Corniche El Nil, Maadi, Cairo",
    bloodType: "A+",
    allergies: [],
    insurance: "GlobeMed Egypt",
    insuranceMemberId: "GM-55678901",
    lastVisit: "2026-11-18",
    nextAppt: "2026-12-02",
    status: "active",
    balance: 0,
    loyaltyPoints: 180,
    notes: "Orthodontics case — braces follow-up monthly.",
  },
  {
    id: "P-003",
    name: "Khalid Nasser",
    dob: "1978-11-30",
    gender: "male",
    phone: "+20 122 456 7890",
    email: "k.nasser@email.com",
    nationalId: "27811305612345",
    address: "22 El Hegaz St., Heliopolis, Cairo",
    bloodType: "B-",
    allergies: ["Latex", "Aspirin"],
    lastVisit: "2026-10-15",
    nextAppt: "2026-11-28",
    status: "overdue",
    balance: -1200,
    loyaltyPoints: 50,
    notes: "Crown prep initiated Oct 2026. Balance outstanding.",
  },
  {
    id: "P-004",
    name: "Sara Hassan",
    dob: "1995-01-22",
    gender: "female",
    phone: "+20 100 321 0987",
    email: "sara.h@email.com",
    nationalId: "29501225412345",
    address: "3 Mohamed Farid St., Downtown, Cairo",
    bloodType: "AB+",
    allergies: [],
    insurance: "AXA Egypt",
    insuranceMemberId: "AX-77123456",
    lastVisit: "2026-11-19",
    nextAppt: "2026-11-24",
    status: "active",
    balance: 0,
    loyaltyPoints: 540,
    notes: "VIP patient. Referred 3 new patients this year.",
  },
  {
    id: "P-005",
    name: "Noura Salem",
    dob: "1987-05-17",
    gender: "female",
    phone: "+20 109 654 3210",
    email: "noura.s@email.com",
    nationalId: "28705175312345",
    address: "9 Syria St., Mohandessin, Giza",
    bloodType: "A-",
    allergies: ["Codeine"],
    lastVisit: "2026-09-03",
    nextAppt: "2026-12-10",
    status: "overdue",
    balance: -300,
    loyaltyPoints: 90,
    notes: "Missed last recall appointment. Needs follow-up call.",
  },
  {
    id: "P-006",
    name: "Tariq Ali",
    dob: "1982-09-05",
    gender: "male",
    phone: "+20 100 789 0123",
    email: "tariq.ali@email.com",
    nationalId: "28209054512345",
    address: "14 El Nozha St., Nasr City, Cairo",
    bloodType: "O-",
    allergies: [],
    insurance: "Allianz Egypt",
    insuranceMemberId: "AL-33445566",
    lastVisit: "2026-11-10",
    nextAppt: "2026-11-30",
    status: "active",
    balance: 0,
    loyaltyPoints: 210,
    notes: "Full mouth rehabilitation plan in progress.",
  },
  {
    id: "P-007",
    name: "Reem Mansour",
    dob: "2001-04-14",
    gender: "female",
    phone: "+20 111 234 5678",
    email: "reem.m@email.com",
    nationalId: "30104144512345",
    address: "55 Ahmed Urabi St., Agouza, Giza",
    bloodType: "B+",
    allergies: [],
    lastVisit: "2026-11-05",
    nextAppt: "2026-12-15",
    status: "active",
    balance: 0,
    loyaltyPoints: 60,
    notes: "Whitening and veneers consultation.",
  },
  {
    id: "P-008",
    name: "Ahmed Sami",
    dob: "1969-12-25",
    gender: "male",
    phone: "+20 100 876 5432",
    email: "ahmed.sami@email.com",
    nationalId: "26912254512345",
    address: "78 Ramsis St., Shubra, Cairo",
    bloodType: "O+",
    allergies: ["NSAIDs"],
    insurance: "Misr Insurance",
    insuranceMemberId: "MI-20077832",
    lastVisit: "2026-10-28",
    nextAppt: null,
    status: "inactive",
    balance: 0,
    loyaltyPoints: 0,
    notes: "Inactive — moved to another clinic (stated preference).",
  },
];

// ─── Appointments ──────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked-in"
  | "in-progress"
  | "completed"
  | "no-show"
  | "cancelled";

export interface DemoAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO date
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  procedure: string;
  room: string;
  status: AppointmentStatus;
  notes?: string;
  amount: number; // EGP
}

export const demoAppointments: DemoAppointment[] = [
  { id: "A-001", patientId: "P-001", patientName: "Omar Al-Farsi", doctorId: "D-001", doctorName: "Dr. Fatima Karim", date: "2026-11-22", startTime: "08:30", endTime: "09:15", procedure: "Routine Check-up", room: "1", status: "scheduled", amount: 200 },
  { id: "A-002", patientId: "P-002", patientName: "Layla Mahmoud", doctorId: "D-002", doctorName: "Dr. Youssef Hamed", date: "2026-11-22", startTime: "09:15", endTime: "10:00", procedure: "Braces Adjustment", room: "2", status: "confirmed", amount: 350 },
  { id: "A-003", patientId: "P-003", patientName: "Khalid Nasser", doctorId: "D-001", doctorName: "Dr. Fatima Karim", date: "2026-11-22", startTime: "10:00", endTime: "11:00", procedure: "Crown Delivery", room: "1", status: "checked-in", amount: 2500 },
  { id: "A-004", patientId: "P-004", patientName: "Sara Hassan", doctorId: "D-003", doctorName: "Dr. Rania Saleh", date: "2026-11-22", startTime: "10:45", endTime: "11:30", procedure: "Scaling & Polishing", room: "3", status: "scheduled", amount: 400 },
  { id: "A-005", patientId: "P-005", patientName: "Noura Salem", doctorId: "D-002", doctorName: "Dr. Youssef Hamed", date: "2026-11-22", startTime: "11:30", endTime: "12:00", procedure: "Consultation", room: "2", status: "scheduled", amount: 150 },
  { id: "A-006", patientId: "P-006", patientName: "Tariq Ali", doctorId: "D-001", doctorName: "Dr. Fatima Karim", date: "2026-11-22", startTime: "13:00", endTime: "14:30", procedure: "Implant Review", room: "1", status: "scheduled", amount: 500 },
  { id: "A-007", patientId: "P-007", patientName: "Reem Mansour", doctorId: "D-003", doctorName: "Dr. Rania Saleh", date: "2026-11-22", startTime: "14:30", endTime: "15:00", procedure: "Whitening Consultation", room: "3", status: "scheduled", amount: 150 },
  // Yesterday
  { id: "A-008", patientId: "P-001", patientName: "Omar Al-Farsi", doctorId: "D-002", doctorName: "Dr. Youssef Hamed", date: "2026-11-21", startTime: "09:00", endTime: "09:45", procedure: "Composite Filling", room: "2", status: "completed", amount: 450, notes: "Upper right molar, shade A2" },
  { id: "A-009", patientId: "P-004", patientName: "Sara Hassan", doctorId: "D-001", doctorName: "Dr. Fatima Karim", date: "2026-11-21", startTime: "11:00", endTime: "11:30", procedure: "X-Ray Review", room: "1", status: "completed", amount: 200 },
  { id: "A-010", patientId: "P-003", patientName: "Khalid Nasser", doctorId: "D-002", doctorName: "Dr. Youssef Hamed", date: "2026-11-21", startTime: "14:00", endTime: "14:30", procedure: "Crown Prep", room: "2", status: "no-show", amount: 0 },
  // Next week
  { id: "A-011", patientId: "P-001", patientName: "Omar Al-Farsi", doctorId: "D-001", doctorName: "Dr. Fatima Karim", date: "2026-11-25", startTime: "09:00", endTime: "09:45", procedure: "Post-Filling Check", room: "1", status: "scheduled", amount: 150 },
  { id: "A-012", patientId: "P-004", patientName: "Sara Hassan", doctorId: "D-003", doctorName: "Dr. Rania Saleh", date: "2026-11-24", startTime: "10:00", endTime: "11:00", procedure: "Veneer Consultation", room: "3", status: "confirmed", amount: 200 },
];

// ─── Doctors (Staff) ───────────────────────────────────────────────────────────

export interface DemoDoctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  phone: string;
  email: string;
  color: string; // calendar color
  schedule: { day: string; from: string; to: string }[];
  commissionRate: number; // %
  joinDate: string;
  status: "active" | "inactive";
}

export const demoDoctors: DemoDoctor[] = [
  {
    id: "D-001",
    name: "Dr. Fatima Karim",
    specialty: "General & Restorative Dentistry",
    qualifications: "BDS (Cairo), MSc Restorative (Ain Shams), MFDS RCS",
    phone: "+20 100 111 2222",
    email: "fatima.karim@northline.clinic",
    color: "#087f80",
    schedule: [
      { day: "Sunday", from: "08:00", to: "15:00" },
      { day: "Monday", from: "08:00", to: "15:00" },
      { day: "Tuesday", from: "08:00", to: "15:00" },
      { day: "Wednesday", from: "08:00", to: "15:00" },
      { day: "Thursday", from: "08:00", to: "13:00" },
    ],
    commissionRate: 35,
    joinDate: "2021-01-15",
    status: "active",
  },
  {
    id: "D-002",
    name: "Dr. Youssef Hamed",
    specialty: "Orthodontics",
    qualifications: "BDS (Alexandria), Diploma Orthodontics (Cairo), MOrth RCS",
    phone: "+20 100 333 4444",
    email: "youssef.hamed@northline.clinic",
    color: "#23734d",
    schedule: [
      { day: "Sunday", from: "10:00", to: "17:00" },
      { day: "Tuesday", from: "10:00", to: "17:00" },
      { day: "Thursday", from: "10:00", to: "17:00" },
      { day: "Saturday", from: "10:00", to: "14:00" },
    ],
    commissionRate: 40,
    joinDate: "2022-06-01",
    status: "active",
  },
  {
    id: "D-003",
    name: "Dr. Rania Saleh",
    specialty: "Cosmetic & Aesthetic Dentistry",
    qualifications: "BDS (Cairo), MSc Aesthetic Dentistry (King's College London)",
    phone: "+20 100 555 6666",
    email: "rania.saleh@northline.clinic",
    color: "#8a5b0a",
    schedule: [
      { day: "Monday", from: "09:00", to: "16:00" },
      { day: "Wednesday", from: "09:00", to: "16:00" },
      { day: "Thursday", from: "09:00", to: "13:00" },
      { day: "Saturday", from: "09:00", to: "14:00" },
    ],
    commissionRate: 38,
    joinDate: "2023-03-20",
    status: "active",
  },
];

// ─── Treatment Plans ───────────────────────────────────────────────────────────

export type TreatmentPlanStatus = "draft" | "presented" | "approved" | "in-progress" | "completed";

export interface TreatmentItem {
  tooth?: string;
  procedure: string;
  quantity: number;
  unitPrice: number;
  status: "pending" | "in-progress" | "completed";
}

export interface DemoTreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: TreatmentPlanStatus;
  createdDate: string;
  approvedDate?: string;
  items: TreatmentItem[];
  totalAmount: number;
  paidAmount: number;
  notes: string;
}

export const demoTreatmentPlans: DemoTreatmentPlan[] = [
  {
    id: "TP-001",
    patientId: "P-003",
    patientName: "Khalid Nasser",
    doctorId: "D-001",
    doctorName: "Dr. Fatima Karim",
    status: "in-progress",
    createdDate: "2026-10-01",
    approvedDate: "2026-10-05",
    items: [
      { tooth: "16", procedure: "Crown (Zirconia)", quantity: 1, unitPrice: 4500, status: "in-progress" },
      { tooth: "26", procedure: "Root Canal Treatment", quantity: 1, unitPrice: 2000, status: "completed" },
      { tooth: "14", procedure: "Composite Filling", quantity: 1, unitPrice: 600, status: "pending" },
    ],
    totalAmount: 7100,
    paidAmount: 2500,
    notes: "Crown delivery scheduled for November. Patient aware of balance.",
  },
  {
    id: "TP-002",
    patientId: "P-006",
    patientName: "Tariq Ali",
    doctorId: "D-001",
    doctorName: "Dr. Fatima Karim",
    status: "in-progress",
    createdDate: "2026-09-15",
    approvedDate: "2026-09-18",
    items: [
      { tooth: "11", procedure: "Implant (Straumann)", quantity: 1, unitPrice: 12000, status: "in-progress" },
      { tooth: "21", procedure: "Implant (Straumann)", quantity: 1, unitPrice: 12000, status: "pending" },
      { procedure: "Full Mouth Scaling", quantity: 1, unitPrice: 800, status: "completed" },
    ],
    totalAmount: 24800,
    paidAmount: 12000,
    notes: "Phase 1 implant placed. Phase 2 in 3 months.",
  },
  {
    id: "TP-003",
    patientId: "P-007",
    patientName: "Reem Mansour",
    doctorId: "D-003",
    doctorName: "Dr. Rania Saleh",
    status: "presented",
    createdDate: "2026-11-05",
    items: [
      { tooth: "11", procedure: "Veneer (E-max)", quantity: 1, unitPrice: 3500, status: "pending" },
      { tooth: "12", procedure: "Veneer (E-max)", quantity: 1, unitPrice: 3500, status: "pending" },
      { tooth: "21", procedure: "Veneer (E-max)", quantity: 1, unitPrice: 3500, status: "pending" },
      { tooth: "22", procedure: "Veneer (E-max)", quantity: 1, unitPrice: 3500, status: "pending" },
      { procedure: "Teeth Whitening (In-office)", quantity: 1, unitPrice: 2000, status: "pending" },
    ],
    totalAmount: 16000,
    paidAmount: 0,
    notes: "Patient considering; follow up scheduled Dec 15.",
  },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "issued" | "paid" | "partial" | "overdue" | "voided";

export interface InvoiceItem {
  description: string;
  tooth?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DemoInvoice {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number; // 14% VAT
  total: number;
  paid: number;
  balance: number;
  paymentMethod?: string;
  insurance?: string;
  insuranceClaim?: string;
  notes?: string;
}

export const demoInvoices: DemoInvoice[] = [
  {
    id: "INV-001",
    patientId: "P-001",
    patientName: "Omar Al-Farsi",
    appointmentId: "A-008",
    status: "partial",
    issueDate: "2026-11-21",
    dueDate: "2026-12-05",
    items: [
      { description: "Composite Filling — Upper Right Molar", tooth: "16", quantity: 1, unitPrice: 600, total: 600 },
      { description: "X-Ray (Periapical)", quantity: 2, unitPrice: 75, total: 150 },
    ],
    subtotal: 750,
    discount: 0,
    tax: 105,
    total: 855,
    paid: 405,
    balance: 450,
    paymentMethod: "Cash",
    notes: "Remaining balance to be settled at next visit.",
  },
  {
    id: "INV-002",
    patientId: "P-002",
    patientName: "Layla Mahmoud",
    appointmentId: "A-002",
    status: "paid",
    issueDate: "2026-11-18",
    dueDate: "2026-11-18",
    items: [
      { description: "Braces Monthly Adjustment", quantity: 1, unitPrice: 350, total: 350 },
    ],
    subtotal: 350,
    discount: 0,
    tax: 49,
    total: 399,
    paid: 399,
    balance: 0,
    paymentMethod: "Bank Transfer",
    insurance: "GlobeMed Egypt",
    insuranceClaim: "CLM-GM-2026-0441",
  },
  {
    id: "INV-003",
    patientId: "P-003",
    patientName: "Khalid Nasser",
    treatmentPlanId: "TP-001",
    status: "partial",
    issueDate: "2026-10-15",
    dueDate: "2026-11-15",
    items: [
      { description: "Root Canal Treatment", tooth: "26", quantity: 1, unitPrice: 2000, total: 2000 },
      { description: "Crown (Zirconia) — Deposit", tooth: "16", quantity: 1, unitPrice: 2000, total: 2000 },
    ],
    subtotal: 4000,
    discount: 300,
    tax: 518,
    total: 4218,
    paid: 2500,
    balance: 1718,
    paymentMethod: "Cash",
    notes: "Instalment plan — EGP 1,718 outstanding at crown delivery.",
  },
  {
    id: "INV-004",
    patientId: "P-004",
    patientName: "Sara Hassan",
    appointmentId: "A-009",
    status: "paid",
    issueDate: "2026-11-19",
    dueDate: "2026-11-19",
    items: [
      { description: "Consultation & X-Ray Review", quantity: 1, unitPrice: 200, total: 200 },
    ],
    subtotal: 200,
    discount: 0,
    tax: 28,
    total: 228,
    paid: 228,
    balance: 0,
    paymentMethod: "Card",
    insurance: "AXA Egypt",
    insuranceClaim: "CLM-AX-2026-1102",
  },
  {
    id: "INV-005",
    patientId: "P-005",
    patientName: "Noura Salem",
    status: "overdue",
    issueDate: "2026-09-10",
    dueDate: "2026-10-10",
    items: [
      { description: "Scaling & Polishing", quantity: 1, unitPrice: 400, total: 400 },
    ],
    subtotal: 400,
    discount: 100,
    tax: 42,
    total: 342,
    paid: 42,
    balance: 300,
    notes: "Patient missed follow-up. Balance overdue since Oct 2026.",
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "open" | "in-progress" | "done";
export type TaskType = "Call" | "Invoice" | "Inventory" | "Clinical" | "Admin" | "Finance" | "Lab";

export interface DemoTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  assignedTo: string;
  patientId?: string;
  patientName?: string;
  due: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdDate: string;
}

export const demoTasks: DemoTask[] = [
  { id: "T-001", title: "Follow up with Omar Al-Farsi", description: "Patient has EGP 450 outstanding balance. Call to confirm payment date before next appointment.", type: "Call", assignedTo: "Reception", patientId: "P-001", patientName: "Omar Al-Farsi", due: "2026-11-22", priority: "high", status: "open", createdDate: "2026-11-21" },
  { id: "T-002", title: "Submit insurance claim — INV-002", description: "GlobeMed claim CLM-GM-2026-0441 submitted but not yet acknowledged.", type: "Invoice", assignedTo: "Reception", patientId: "P-002", patientName: "Layla Mahmoud", due: "2026-11-22", priority: "medium", status: "open", createdDate: "2026-11-20" },
  { id: "T-003", title: "Restock composite resins (A2, A3)", description: "Stock dropped below minimum threshold. Place order with Dentsply supplier.", type: "Inventory", assignedTo: "Dr. Fatima Karim", due: "2026-11-23", priority: "low", status: "open", createdDate: "2026-11-21" },
  { id: "T-004", title: "Review Khalid Nasser X-ray", description: "CBCT scan taken Oct 15 — requires radiological report before crown delivery.", type: "Clinical", assignedTo: "Dr. Fatima Karim", patientId: "P-003", patientName: "Khalid Nasser", due: "2026-11-23", priority: "high", status: "open", createdDate: "2026-11-20" },
  { id: "T-005", title: "November recall list — 12 patients", description: "Send WhatsApp recall messages to 12 patients last visited in May 2026.", type: "Admin", assignedTo: "Reception", due: "2026-11-25", priority: "medium", status: "in-progress", createdDate: "2026-11-18" },
  { id: "T-006", title: "October payroll preparation", description: "Calculate doctor commissions and receptionist salaries for October.", type: "Finance", assignedTo: "Admin", due: "2026-11-05", priority: "low", status: "done", createdDate: "2026-11-01" },
  { id: "T-007", title: "Lab order — Khalid crown (Zirconia)", description: "Confirm ceramic lab has received impression and delivery ETA.", type: "Lab", assignedTo: "Dr. Fatima Karim", patientId: "P-003", patientName: "Khalid Nasser", due: "2026-11-24", priority: "high", status: "open", createdDate: "2026-11-21" },
  { id: "T-008", title: "Noura Salem overdue balance", description: "Balance of EGP 300 overdue since October. Contact and arrange payment.", type: "Call", assignedTo: "Reception", patientId: "P-005", patientName: "Noura Salem", due: "2026-11-22", priority: "medium", status: "open", createdDate: "2026-11-21" },
];

// ─── Inventory ────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low" | "out-of-stock" | "on-order";

export interface DemoInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
  status: StockStatus;
  linkedProcedures: string[];
}

export const demoInventory: DemoInventoryItem[] = [
  { id: "INV-I-001", name: "Composite Resin A2 (Filtek Supreme)", category: "Restorative", unit: "syringe", quantity: 3, minQuantity: 5, unitCost: 280, supplier: "Dentsply Sirona Egypt", lastRestocked: "2026-10-01", status: "low", linkedProcedures: ["Composite Filling"] },
  { id: "INV-I-002", name: "Composite Resin A3 (Filtek Supreme)", category: "Restorative", unit: "syringe", quantity: 1, minQuantity: 5, unitCost: 280, supplier: "Dentsply Sirona Egypt", lastRestocked: "2026-10-01", status: "low", linkedProcedures: ["Composite Filling"] },
  { id: "INV-I-003", name: "Scaling Tips (EMS Perio Slim)", category: "Hygiene", unit: "tip", quantity: 24, minQuantity: 10, unitCost: 85, supplier: "EMS Egypt", lastRestocked: "2026-11-01", status: "in-stock", linkedProcedures: ["Scaling & Polishing"] },
  { id: "INV-I-004", name: "Local Anaesthetic (Lidocaine 2%)", category: "Anaesthesia", unit: "carpule", quantity: 80, minQuantity: 50, unitCost: 18, supplier: "Septodont", lastRestocked: "2026-11-05", status: "in-stock", linkedProcedures: ["All procedures"] },
  { id: "INV-I-005", name: "Surgical Gloves (M)", category: "PPE", unit: "pair", quantity: 150, minQuantity: 100, unitCost: 5, supplier: "Medline Egypt", lastRestocked: "2026-11-10", status: "in-stock", linkedProcedures: [] },
  { id: "INV-I-006", name: "Impression Material (Alginate)", category: "Impressions", unit: "kg", quantity: 2, minQuantity: 3, unitCost: 220, supplier: "Zhermack", lastRestocked: "2026-10-15", status: "low", linkedProcedures: ["Crown Prep", "Implant"] },
  { id: "INV-I-007", name: "Zirconia Blanks (A1)", category: "Prosthetics", unit: "disc", quantity: 0, minQuantity: 2, unitCost: 850, supplier: "Ceramill", lastRestocked: "2026-09-20", status: "out-of-stock", linkedProcedures: ["Crown (Zirconia)"] },
  { id: "INV-I-008", name: "Sterilisation Pouches", category: "Sterilisation", unit: "box", quantity: 8, minQuantity: 5, unitCost: 120, supplier: "Medline Egypt", lastRestocked: "2026-11-01", status: "in-stock", linkedProcedures: [] },
];

// ─── Labs ─────────────────────────────────────────────────────────────────────

export type LabOrderStatus = "sent" | "in-production" | "shipped" | "received" | "delivered" | "rejected";

export interface DemoLabOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  labName: string;
  workType: string;
  tooth: string;
  sentDate: string;
  expectedDate: string;
  receivedDate?: string;
  status: LabOrderStatus;
  cost: number;
  notes?: string;
}

export const demoLabOrders: DemoLabOrder[] = [
  { id: "LAB-001", patientId: "P-003", patientName: "Khalid Nasser", doctorId: "D-001", labName: "Cairo Ceramics Lab", workType: "Zirconia Crown", tooth: "16", sentDate: "2026-11-01", expectedDate: "2026-11-25", status: "in-production", cost: 1200, notes: "Shade A2, full contour" },
  { id: "LAB-002", patientId: "P-006", patientName: "Tariq Ali", doctorId: "D-001", labName: "Cairo Ceramics Lab", workType: "Implant Abutment", tooth: "11", sentDate: "2026-10-20", expectedDate: "2026-11-15", receivedDate: "2026-11-14", status: "received", cost: 2500, notes: "Straumann compatible" },
  { id: "LAB-003", patientId: "P-007", patientName: "Reem Mansour", doctorId: "D-003", labName: "Elite Dental Lab", workType: "E-max Veneers", tooth: "11,12,21,22", sentDate: "2026-11-10", expectedDate: "2026-12-05", status: "sent", cost: 4000, notes: "BL1 shade, mock-up approved" },
];

// ─── Finance summary ───────────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  collected: number;
}

export const demoMonthlyRevenue: MonthlyRevenue[] = [
  { month: "May", revenue: 42000, expenses: 18500, collected: 38000 },
  { month: "Jun", revenue: 38500, expenses: 17200, collected: 35000 },
  { month: "Jul", revenue: 35000, expenses: 16800, collected: 32000 },
  { month: "Aug", revenue: 29000, expenses: 15400, collected: 26500 },
  { month: "Sep", revenue: 44500, expenses: 19200, collected: 41000 },
  { month: "Oct", revenue: 51200, expenses: 21500, collected: 48000 },
  { month: "Nov", revenue: 28400, expenses: 11800, collected: 24600 },
];

// ─── Insurance Claims ─────────────────────────────────────────────────────────

export type ClaimStatus = "draft" | "submitted" | "pending" | "approved" | "partial" | "rejected" | "resubmitted";

export interface DemoClaim {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  insurance: string;
  memberId: string;
  submittedDate: string;
  amount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  rejectionReason?: string;
  notes?: string;
}

export const demoClaims: DemoClaim[] = [
  { id: "CLM-001", invoiceId: "INV-002", patientId: "P-002", patientName: "Layla Mahmoud", insurance: "GlobeMed Egypt", memberId: "GM-55678901", submittedDate: "2026-11-18", amount: 399, approvedAmount: 350, status: "partial", notes: "Tax not covered. Balance charged to patient." },
  { id: "CLM-002", invoiceId: "INV-004", patientId: "P-004", patientName: "Sara Hassan", insurance: "AXA Egypt", memberId: "AX-77123456", submittedDate: "2026-11-19", amount: 228, approvedAmount: 228, status: "approved" },
  { id: "CLM-003", invoiceId: "INV-003", patientId: "P-003", patientName: "Khalid Nasser", insurance: "", memberId: "", submittedDate: "", amount: 0, status: "draft", notes: "Patient has no insurance. Cash payment only." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export function getPatientById(id: string) {
  return demoPatients.find((p) => p.id === id);
}

export function getAppointmentsForDate(date: string) {
  return demoAppointments.filter((a) => a.date === date);
}

export function getAppointmentsForPatient(patientId: string) {
  return demoAppointments.filter((a) => a.patientId === patientId);
}

export function getTreatmentPlansForPatient(patientId: string) {
  return demoTreatmentPlans.filter((tp) => tp.patientId === patientId);
}

export function getInvoicesForPatient(patientId: string) {
  return demoInvoices.filter((inv) => inv.patientId === patientId);
}

export const TODAY = "2026-11-22";
