import { getSession } from "@/lib/auth";
import { clinicSettings, getDb } from "@/db";
import { SettingsClient } from "./settings-client";
import { DEFAULT_OPENING_HOURS, type OpeningHour } from "@/lib/public-clinic-settings";

export const metadata = { title: "Clinic Settings — Northline Dental Clinic" };

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

  const fallbackIntegrations: IntegrationItem[] = [
    { name: "Google Calendar", status: "connected", icon: "📅", description: "Two-way sync per doctor." },
    { name: "Google Drive", status: "connected", icon: "☁️", description: "Automatic daily backup." },
    { name: "WhatsApp Business", status: "not-connected", icon: "💬", description: "Automated appointment reminders and recalls." },
    { name: "Resend (Email)", status: "connected", icon: "✉️", description: "Transactional emails and recall campaigns." },
    { name: "Cloudflare R2", status: "connected", icon: "📁", description: "Patient file and image storage." },
  ];

const supportedIntegrations = new Set(fallbackIntegrations.map((item) => item.name));

  const initialSettings = {
    clinicName: row?.clinicName || "Northline Dental Clinic",
    branchName: row?.branchName || "Main Branch",
    address: row?.address || "1 Tahrir Square, Downtown, Cairo, Egypt",
    phone: row?.phone || "+20 2 2222 3333",
    email: row?.email || "hello@northline.clinic",
    taxId: row?.taxId || "310122393500003",
    publicPricelist: row?.publicPricelist ?? true,
    openingHours: Array.isArray(row?.openingHours) && row.openingHours.length === 7
      ? (row.openingHours as OpeningHour[])
      : DEFAULT_OPENING_HOURS,
    integrations: Array.isArray(row?.integrations)
      ? (row.integrations as IntegrationItem[]).filter((item) => supportedIntegrations.has(item.name))
      : fallbackIntegrations,
  };

  return <SettingsClient initialSettings={initialSettings} />;
}
