import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/internal/sidebar";
import { TopBar } from "@/components/internal/topbar";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgRole } = await auth();

  // 1. Not signed in → redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Read live organization role directly from Clerk
  let isAdmin = orgRole === "org:admin" || orgRole === "admin";

  if (!isAdmin) {
    try {
      const client = await clerkClient();
      const memberships = await client.users.getOrganizationMembershipList({
        userId,
      });

      // User must be an Admin in at least one organization in your Clerk instance
      isAdmin = memberships.data.some(
        (m) => m.role === "org:admin" || m.role === "admin"
      );
    } catch {
      isAdmin = false;
    }
  }

  // If user is just a Member or has no admin organization role → 403 (auto signs out)
  if (!isAdmin) {
    redirect("/403");
  }

  return (
    <div className="internal-shell">
      <Sidebar />
      <TopBar />
      <main className="internal-content" id="main-content">
        {children}
      </main>
    </div>
  );
}
