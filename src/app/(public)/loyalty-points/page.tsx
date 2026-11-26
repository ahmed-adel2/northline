import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { and, isNull, or, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { clinicSettings, getDb, patients } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Loyalty Points — Northline Dental Clinic" };

export default async function LoyaltyPointsPage() {
  const { userId, orgRole } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/loyalty-points");

  if (orgRole === "org:admin" || orgRole === "admin") notFound();
  let memberships;
  try {
    const client = await clerkClient();
    memberships = await client.users.getOrganizationMembershipList({ userId });
  } catch {
    notFound();
  }
  if (memberships.data.some((membership) => membership.role === "org:admin" || membership.role === "admin")) {
    notFound();
  }

  const db = getDb();
  const [settings] = await db
    .select({ loyaltyEnabled: clinicSettings.loyaltyEnabled })
    .from(clinicSettings)
    .limit(1);
  if (!(settings?.loyaltyEnabled ?? true)) notFound();

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  const email = primaryEmail?.verification?.status === "verified"
    ? primaryEmail.emailAddress.trim().toLowerCase()
    : null;
  const primaryPhone = user?.primaryPhoneNumber;
  const username = user?.username?.trim() ?? "";
  const usernameIsPhone = /^\+?[\d\s().-]+$/.test(username) && username.replace(/\D/g, "").length >= 7;
  const phoneCandidates = [
    ...(primaryPhone?.verification?.status === "verified" ? [primaryPhone.phoneNumber] : []),
    ...(usernameIsPhone ? [username] : []),
  ].map((phone) => phone.replace(/\s+/g, ""));
  const matchConditions = [
    ...(email ? [sql`lower(trim(${patients.email})) = ${email}`] : []),
    ...phoneCandidates.map((phone) =>
      sql`regexp_replace(${patients.phone}, '[[:space:]]+', '', 'g') = ${phone}`
    ),
  ];
  const matches = matchConditions.length > 0
    ? await db
        .select({ fullName: patients.fullName, loyaltyPoints: patients.loyaltyPoints })
        .from(patients)
        .where(and(
          or(...matchConditions),
          isNull(patients.archivedAt),
        ))
        .limit(2)
    : [];
  const patient = matches.length === 1 ? matches[0] : null;
  const points = patient?.loyaltyPoints ?? 0;

  return (
    <>
      <section className="page-hero loyalty-hero" aria-labelledby="loyalty-title">
        <div className="page-hero-copy">
          <h1 id="loyalty-title">Loyalty Points</h1>
          <p className="hero-description">Your points balance, kept in one place.</p>
        </div>
        <section className="loyalty-balance" aria-label="Your loyalty points balance">
          <span className="loyalty-balance-label">Current balance</span>
          <p className="loyalty-balance-value" aria-live="polite">{points.toLocaleString("en-EG")}</p>
          <span className="loyalty-balance-unit">{points === 1 ? "point" : "points"}</span>
        </section>
      </section>

      <section className="loyalty-details section-wrap" aria-labelledby="loyalty-details-title">
        <div className="loyalty-details-copy">
          <h2 id="loyalty-details-title">Your points balance</h2>
          {points === 0 ? (
            <>
              <p>{patient ? `Hello, ${patient.fullName}. ` : ""}Your current balance is zero. For details about the loyalty points programme, please contact the clinic.</p>
              <a className="button button-primary" href="/contact">Contact the clinic</a>
            </>
          ) : (
            <p>Your current balance is shown above. Contact the clinic if you have questions about your points.</p>
          )}
        </div>
      </section>
    </>
  );
}
