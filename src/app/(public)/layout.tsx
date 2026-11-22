import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppChatButton } from "@/components/public/whatsapp-chat-button";
import "@/app/home.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div id="page-top" aria-hidden="true" />
      <SiteHeader />
      <main id="main-content" className="public-main">{children}</main>
      <SiteFooter />
      <WhatsAppChatButton />
    </>
  );
}