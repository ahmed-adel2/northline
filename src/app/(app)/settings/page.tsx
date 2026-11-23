import { getSession } from "@/lib/auth";
import { clinicSettings, getDb } from "@/db";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Clinic Settings — Northline Dental Clinic" };

interface OpeningHour {
  day: string;
  from: string;
  to: string;
  open: boolean;
}

interface IntegrationItem {
  name: string;
  status: "connected" | "not-connected";
  icon: string;
  description: string;
}

export default async function SettingsPage() {
  await getSession();
  const db = getDb();
  const [row] = await db.select().from(clinicSettings).limit(1);

  const fallbackHours: OpeningHour[] = [
    { day: "Sunday", from: "08:00", to: "17:00", open: true },
    { day: "Monday", from: "08:00", to: "17:00", open: true },
    { day: "Tuesday", from: "08:00", to: "17:00", open: true },
    { day: "Wednesday", from: "08:00", to: "17:00", open: true },
    { day: "Thursday", from: "08:00", to: "14:00", open: true },
    { day: "Friday", from: "—", to: "—", open: false },
    { day: "Saturday", from: "09:00", to: "13:00", open: true },
  ];

  const fallbackIntegrations: IntegrationItem[] = [
    { name: "Google Calendar", status: "connected", icon: "📅", description: "Two-way sync per doctor." },
    { name: "Google Drive", status: "connected", icon: "☁️", description: "Automatic daily backup." },
    { name: "WhatsApp Business", status: "not-connected", icon: "💬", description: "Automated appointment reminders and recalls." },
    { name: "Resend (Email)", status: "connected", icon: "✉️", description: "Transactional emails and recall campaigns." },
    { name: "Cloudflare R2", status: "connected", icon: "📁", description: "Patient file and image storage." },
    { name: "ZATCA e-Invoicing", status: "not-connected", icon: "🧾", description: "Phase 2 clearance adapter." },
    { name: "NPHIES Insurance", status: "not-connected", icon: "🏥", description: "Saudi insurance claims gateway." },
  ];

  const initialSettings = {
    clinicName: row?.clinicName || "Northline Dental Clinic",
    branchName: row?.branchName || "Main Branch",
    address: row?.address || "1 Tahrir Square, Downtown, Cairo, Egypt",
    phone: row?.phone || "+20 2 2222 3333",
    email: row?.email || "hello@northline.clinic",
    taxId: row?.taxId || "310122393500003",
    publicPricelist: row?.publicPricelist ?? true,
    openingHours: (row?.openingHours as OpeningHour[]) || fallbackHours,
    integrations: (row?.integrations as IntegrationItem[]) || fallbackIntegrations,
  };

  return <SettingsClient initialSettings={initialSettings} />;
}
