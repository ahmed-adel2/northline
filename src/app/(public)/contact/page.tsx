import { getPublicClinicSettings } from "@/lib/public-clinic-settings";
import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getPublicClinicSettings();
  return (
    <ContactClient
      phone={settings.phone}
      email={settings.email}
      address={settings.address}
    />
  );
}
