import { getPublicClinicSettings } from "@/lib/public-clinic-settings";
import ServicesClient from "./services-client";

export default async function ServicesPage() {
  const settings = await getPublicClinicSettings();
  return <ServicesClient showPricelist={settings.publicPricelist} />;
}
