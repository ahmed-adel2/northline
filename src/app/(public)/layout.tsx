import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppChatButton } from "@/components/public/whatsapp-chat-button";
import { getPublicClinicSettings } from "@/lib/public-clinic-settings";
import "@/app/home.css";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicClinicSettings();
  return (
    <>
      <div id="page-top" aria-hidden="true" />
      <SiteHeader showPricelist={settings.publicPricelist} />
      <main id="main-content" className="public-main">{children}</main>
      <SiteFooter
        showPricelist={settings.publicPricelist}
        openingHours={settings.openingHours}
        clinicName={settings.clinicName}
        address={settings.address}
        phone={settings.phone}
        email={settings.email}
      />
      <WhatsAppChatButton phone={settings.phone} clinicName={settings.clinicName} />
    </>
  );
}
