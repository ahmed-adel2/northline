import { notFound } from "next/navigation";
import { getPublicClinicSettings } from "@/lib/public-clinic-settings";
import PricelistClient from "./pricelist-client";

export const metadata = { title: "Pricelist — Northline Dental Clinic" };

export default async function PricelistPage() {
  const settings = await getPublicClinicSettings();
  if (!settings.publicPricelist) notFound();
  return <PricelistClient />;
}
