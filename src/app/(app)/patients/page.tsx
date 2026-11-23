import Link from "next/link";
import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, patients } from "@/db";
import { fmtDate, patientCode } from "@/lib/format";

export const metadata = { title: "Patients Directory — Northline Dental Clinic" };

const PAGE = 25;
const FILTERS = ["all", "active", "overdue", "inactive"] as const;

const FILTER_LABELS: Record<string, string> = {
  all: "All patients",
  active: "Active",
  overdue: "Overdue",
  inactive: "Inactive",
};

export default async function Patients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; s?: string; p?: string }>;
}) {
  await getSession();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const s = FILTERS.includes(sp.s as (typeof FILTERS)[number])
    ? (sp.s as string)
    : "all";
  const page = Math.max(1, Number(sp.p) || 1);

  const where = and(
    isNull(patients.archivedAt),
    s !== "all"
      ? eq(patients.status, s as "active" | "overdue" | "inactive")
      : undefined,
    q
      ? or(
          ilike(patients.fullName, `%${q}%`),
          ilike(patients.phone, `%${q}%`),
          ilike(patients.nationalId, `%${q}%`),
          sql`('P-' || lpad(${patients.patientNo}::text, 3, '0')) ilike ${`%${q}%`}`
        )
      : undefined
  );

  const db = getDb();
  const [rows, [{ n }]] = await Promise.all([
    db
      .select()
      .from(patients)
      .where(where)
      .orderBy(desc(patients.createdAt))
      .limit(PAGE)
      .offset((page - 1) * PAGE),
    db.select({ n: count() }).from(patients).where(where),
  ]);

  const href = (o: { s?: string; p?: number }) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    const st = o.s ?? s;
    if (st !== "all") u.set("s", st);
    if (o.p && o.p > 1) u.set("p", String(o.p));
    const t = u.toString();
    return `/patients${t ? `?${t}` : ""}`;
  };

  const totalPages = Math.ceil(n / PAGE);

  return (
    <div className="patients-page-wrap">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Electronic Dental Records</span>
          </div>
          <h1>Patient Directory</h1>
          <p className="page-header-sub">
            {n} {n === 1 ? "registered patient" : "registered patients"} on file
          </p>
        </div>
        <div className="header-actions">
          <Link href="/patients/new" className="button button-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-icon"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>+ New patient</span>
          </Link>
        </div>
      </div>

      {/* ── Search + Filter Card ──────────────────────────── */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <form
          className="m-search"
          action="/patients"
          role="search"
          style={{ marginBottom: "1rem" }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "1.1rem",
                height: "1.1rem",
                color: "var(--clinic-muted)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name, phone, National ID, or code P-001…"
              aria-label="Search patients"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          {s !== "all" && <input type="hidden" name="s" value={s} />}
          <button className="button button-secondary" type="submit">
            Search
          </button>
        </form>

        <div
          className="m-chips"
          role="group"
          aria-label="Filter by status"
          style={{
            borderTop: "1px solid var(--clinic-hairline-soft)",
            paddingTop: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--clinic-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              alignSelf: "center",
              marginRight: "0.25rem",
              flexShrink: 0,
            }}
          >
            Status:
          </span>
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={href({ s: f })}
              className={`filter-chip${s === f ? " filter-chip-active" : ""}`}
            >
              {FILTER_LABELS[f]}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="card">
          <div className="m-empty" style={{ padding: "3rem 1.5rem" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="empty-icon"
              aria-hidden="true"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <h3>
              {q || s !== "all"
                ? "No patients match your search"
                : "No patients registered yet"}
            </h3>
            <p>
              {q || s !== "all"
                ? "Try adjusting your search terms or clearing the filter."
                : "Get started by registering the first patient file."}
            </p>
            <Link href="/patients/new" className="button button-primary">
              + Register first patient
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>
              Patient Records ({rows.length}
              {totalPages > 1 && ` of ${n}`})
            </h2>
            <span className="card-subtitle">
              Page {page} of {totalPages}
            </span>
          </div>
          <div className="card-body">
            <ul className="m-list" style={{ gridTemplateColumns: "1fr" }}>
              {rows.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${patientCode(p.patientNo)}`}
                    className="m-row"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        minWidth: 0,
                      }}
                    >
                      <div
                        className="patient-avatar-mini"
                        style={{ width: "2.35rem", height: "2.35rem", fontSize: "0.95rem", flexShrink: 0 }}
                        aria-hidden="true"
                      >
                        {p.fullName[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span className="m-row-title">{p.fullName}</span>
                        <div className="m-row-sub">
                          <span className="patient-code-tag">
                            {patientCode(p.patientNo)}
                          </span>
                          <span className="meta-sep">·</span>
                          <span>{p.phone}</span>
                          {p.bloodType && (
                            <>
                              <span className="meta-sep">·</span>
                              <span>Blood: {p.bloodType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="m-row-end">
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                      <span className="m-row-sub" style={{ fontSize: "0.72rem" }}>
                        Since {fmtDate(p.createdAt.toISOString().slice(0, 10))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────── */}
      {n > PAGE && (
        <nav className="m-pager" aria-label="Pagination">
          {page > 1 ? (
            <Link
              className="button button-secondary"
              href={href({ p: page - 1 })}
              aria-label="Previous page"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span style={{ fontSize: "0.82rem", color: "var(--clinic-muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page * PAGE < n && (
            <Link
              className="button button-secondary"
              href={href({ p: page + 1 })}
              aria-label="Next page"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
