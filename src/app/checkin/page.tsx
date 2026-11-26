import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, gte, ilike, isNull, or, sql } from "drizzle-orm";
import { getDb, patientArrivals, patients } from "@/db";
import "@/app/home.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Patient Check-in — Northline Dental Clinic",
};

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const sp = await searchParams;
  const passCode = (sp.p ?? "").trim();
  const redirectPath = passCode ? `/checkin?p=${encodeURIComponent(passCode)}` : "/checkin";

  const { userId } = await auth();

  if (!userId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1.25rem",
          background: "var(--clinic-ground)",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "28rem",
            width: "100%",
            padding: "2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              margin: "0 auto",
              borderRadius: "var(--clinic-radius-md)",
              background: "var(--clinic-teal-tint)",
              color: "var(--clinic-teal-deep)",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            ND
          </div>
          <h1 style={{ margin: 0, fontSize: "1.45rem", color: "var(--clinic-ink)" }}>
            Northline Dental Check-in
          </h1>
          <p style={{ margin: 0, color: "var(--clinic-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Sign in or create an account to register your arrival at reception.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.5rem" }}>
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`}
              className="button button-secondary"
              style={{ justifyContent: "center" }}
            >
              Sign in to Check In
            </Link>
            <Link
              href={`/sign-up?redirect_url=${encodeURIComponent(redirectPath)}`}
              className="button button-secondary"
              style={{ justifyContent: "center" }}
            >
              New Member? Sign up
            </Link>
          </div>
        </div>
      </main >
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const username = user?.username ?? null;
  const phone = user?.phoneNumbers?.[0]?.phoneNumber ?? null;
  const memberName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    username ||
    email ||
    "Patient";

  const db = getDb();

  // Match against existing patients in Supabase by email or phone/username
  const matchConditions = [
    email ? ilike(patients.email, email) : undefined,
    phone ? eq(patients.phone, phone) : undefined,
    username ? eq(patients.phone, username) : undefined,
    username ? ilike(patients.email, username) : undefined,
  ].filter(Boolean);

  const matchedPatient =
    matchConditions.length > 0
      ? (
        await db
          .select({ id: patients.id })
          .from(patients)
          .where(and(isNull(patients.archivedAt), or(...matchConditions)))
          .limit(1)
      )[0]
      : undefined;

  // Avoid duplicate check-in rows if the patient refreshes within 10 minutes
  const [recentArrival] = await db
    .select()
    .from(patientArrivals)
    .where(
      and(
        eq(patientArrivals.clerkUserId, userId),
        gte(patientArrivals.arrivedAt, sql`NOW() - INTERVAL '10 minutes'`)
      )
    )
    .orderBy(desc(patientArrivals.arrivedAt))
    .limit(1);

  const arrival =
    recentArrival ??
    (
      await db
        .insert(patientArrivals)
        .values({
          clerkUserId: userId,
          memberName,
          email,
          username,
          phone,
          patientId: matchedPatient?.id ?? null,
        })
        .returning()
    )[0];

  const arrivedDate = arrival.arrivedAt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const arrivedTime = arrival.arrivedAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1.25rem",
        background: "var(--clinic-ground)",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "30rem",
          width: "100%",
          padding: "2.25rem 2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "3.25rem",
            height: "3.25rem",
            margin: "0 auto",
            borderRadius: "999px",
            background: "var(--clinic-teal-tint)",
            color: "var(--clinic-teal-deep)",
            display: "grid",
            placeItems: "center",
            fontSize: "1.4rem",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "var(--clinic-ink)" }}>
          Arrival Registered
        </h1>
        <p style={{ margin: 0, color: "var(--clinic-muted)", fontSize: "0.94rem", lineHeight: 1.5 }}>
          Welcome, <strong style={{ color: "var(--clinic-ink)" }}>{arrival.memberName}</strong>.
          Our reception desk has been notified of your arrival.
        </p>

        <div
          style={{
            background: "var(--clinic-ground)",
            border: "1px solid var(--clinic-hairline)",
            borderRadius: "var(--clinic-radius-sm)",
            padding: "0.9rem 1rem",
            textAlign: "left",
            fontSize: "0.85rem",
            display: "grid",
            gap: "0.35rem",
          }}
        >
          <div>
            <span style={{ color: "var(--clinic-muted)" }}>Date &amp; Time: </span>
            <strong style={{ color: "var(--clinic-ink)" }}>
              {arrivedDate} · {arrivedTime}
            </strong>
          </div>
          {arrival.email && (
            <div>
              <span style={{ color: "var(--clinic-muted)" }}>Email: </span>
              <span style={{ color: "var(--clinic-ink)" }}>{arrival.email}</span>
            </div>
          )}
          {arrival.username && (
            <div>
              <span style={{ color: "var(--clinic-muted)" }}>Username: </span>
              <span style={{ color: "var(--clinic-ink)" }}>{arrival.username}</span>
            </div>
          )}
        </div>

        <Link href="/" className="button button-secondary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
          Return to Northline Website
        </Link>
      </div>
    </main>
  );
}
