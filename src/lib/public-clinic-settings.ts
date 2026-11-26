import { cache } from "react";
import { clinicSettings, getDb } from "@/db";

export interface OpeningHour {
  day: string;
  from: string;
  to: string;
  open: boolean;
}

export const DEFAULT_OPENING_HOURS: OpeningHour[] = [
  { day: "Sunday", from: "08:00", to: "17:00", open: true },
  { day: "Monday", from: "08:00", to: "17:00", open: true },
  { day: "Tuesday", from: "08:00", to: "17:00", open: true },
  { day: "Wednesday", from: "08:00", to: "17:00", open: true },
  { day: "Thursday", from: "08:00", to: "14:00", open: true },
  { day: "Friday", from: "", to: "", open: false },
  { day: "Saturday", from: "09:00", to: "13:00", open: true },
];

export const getPublicClinicSettings = cache(async () => {
  const [row] = await getDb()
    .select({
      clinicName: clinicSettings.clinicName,
      branchName: clinicSettings.branchName,
      address: clinicSettings.address,
      phone: clinicSettings.phone,
      email: clinicSettings.email,
      taxId: clinicSettings.taxId,
      publicPricelist: clinicSettings.publicPricelist,
      loyaltyEnabled: clinicSettings.loyaltyEnabled,
      openingHours: clinicSettings.openingHours,
    })
    .from(clinicSettings)
    .limit(1);

  const openingHours =
    Array.isArray(row?.openingHours) && row.openingHours.length === 7
      ? (row.openingHours as OpeningHour[])
      : DEFAULT_OPENING_HOURS;

  return {
    clinicName: row?.clinicName || "Northline Dental Clinic",
    branchName: row?.branchName || "Main Branch",
    address: row?.address || "1 Tahrir Square, Downtown, Cairo, Egypt",
    phone: row?.phone || "+201011604114",
    email: row?.email || "hello@northline.clinic",
    taxId: row?.taxId || "",
    publicPricelist: row?.publicPricelist ?? true,
    loyaltyEnabled: row?.loyaltyEnabled ?? true,
    openingHours,
  };
});
