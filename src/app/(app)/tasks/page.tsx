import Link from "next/link";
import { and, asc, desc, eq, isNull, lte, ne, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, patients, staffMembers, tasks } from "@/db";
import { TaskForm } from "@/components/internal/task-form";
import { ConfirmButton } from "@/components/internal/confirm-button";
import { fmtDate, todayISO } from "@/lib/format";
import { createTask, deleteTask, setTaskStatus } from "./actions";

export const metadata = { title: "Tasks & Follow-ups — Northline Dental Clinic" };

const FILTERS = [
  ["open", "Open"],
  ["due", "Due today"],
  ["high", "High priority"],
  ["done", "Completed"],
] as const;

export default async function Tasks({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  await getSession();
  const { f = "open" } = await searchParams;
  const today = todayISO();
  const db = getDb();

  const where =
    f === "done"
      ? eq(tasks.status, "done")
      : f === "due"
      ? and(ne(tasks.status, "done"), lte(tasks.dueDate, today))
      : f === "high"
      ? and(ne(tasks.status, "done"), eq(tasks.priority, "high"))
      : ne(tasks.status, "done");

  const [rows, pts, staff] = await Promise.all([
    db
      .select({ t: tasks, patient: patients.fullName })
      .from(tasks)
      .leftJoin(patients, eq(tasks.patientId, patients.id))
      .where(where)
      .orderBy(sql`${tasks.dueDate} asc nulls last`, desc(tasks.createdAt))
      .limit(100),
    db
      .select({ id: patients.id, name: patients.fullName })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(asc(patients.fullName)),
    db
      .select({ n: staffMembers.fullName })
      .from(staffMembers)
      .where(eq(staffMembers.active, true)),
  ]);

  return (
    <div className="tasks-page-wrap">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Clinic Workflow &amp; Reminders</span>
          </div>
          <h1>Tasks &amp; Action Items</h1>
          <p className="page-header-sub">
            Patient recalls, lab follow-ups, stock replenishment, and billing duties
          </p>
        </div>
      </div>

      {/* ── Create Task ───────────────────────────────────── */}
      <details className="card task-create-details">
        <summary className="task-create-summary">
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create new clinical task
        </summary>
        <div className="task-create-body">
          <TaskForm
            action={createTask}
            patients={pts.map((p) => ({ id: p.id, label: p.name }))}
            staff={staff.map((s) => s.n)}
          />
        </div>
      </details>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="card" style={{ padding: "0.9rem 1.25rem" }}>
        <div className="m-chips" role="group" aria-label="Filter tasks">
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
            Filter:
          </span>
          {FILTERS.map(([k, l]) => (
            <Link
              key={k}
              href={`/tasks?f=${k}`}
              className={`filter-chip${f === k ? " filter-chip-active" : ""}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Task List ─────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="m-empty">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="empty-icon"
            aria-hidden="true"
          >
            {f === "done" ? (
              <circle cx="12" cy="12" r="10" />
            ) : (
              <>
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
          <h3>
            {f === "done" ? "Nothing completed yet." : "All clear here!"}
          </h3>
          <p>
            {f === "done"
              ? "Mark tasks done to see them here."
              : "No tasks match this filter. Great work!"}
          </p>
        </div>
      ) : (
        <ul className="m-list" style={{ gridTemplateColumns: "1fr" }}>
          {rows.map(({ t, patient }) => {
            const late =
              t.status !== "done" && t.dueDate && t.dueDate < today;
            return (
              <li
                key={t.id}
                className="m-appt"
                style={{
                  ["--doc" as string]: late
                    ? "var(--clinic-danger)"
                    : t.priority === "high"
                    ? "var(--clinic-warning)"
                    : undefined,
                }}
              >
                <div className="m-appt-top">
                  <span className="m-row-title">{t.title}</span>
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                </div>

                <div className="m-row-sub">
                  <span>{t.type}</span>
                  {t.dueDate && (
                    <>
                      <span className="meta-sep">·</span>
                      <span
                        style={{
                          color: late
                            ? "var(--clinic-danger)"
                            : "inherit",
                          fontWeight: late ? 600 : undefined,
                        }}
                      >
                        Due {fmtDate(t.dueDate)}
                        {late && " (overdue)"}
                      </span>
                    </>
                  )}
                  {t.assignedTo && (
                    <>
                      <span className="meta-sep">·</span>
                      <span>{t.assignedTo}</span>
                    </>
                  )}
                  {patient && (
                    <>
                      <span className="meta-sep">·</span>
                      <span>{patient}</span>
                    </>
                  )}
                </div>

                {t.description && (
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--clinic-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {t.description}
                  </div>
                )}

                <div className="m-appt-btns">
                  {t.status !== "done" ? (
                    <>
                      <form action={setTaskStatus.bind(null, t.id, "done")}>
                        <button className="button button-primary">Mark done</button>
                      </form>
                      {t.status === "open" && (
                        <form
                          action={setTaskStatus.bind(null, t.id, "in-progress")}
                        >
                          <button className="button button-secondary">Start</button>
                        </form>
                      )}
                    </>
                  ) : (
                    <form action={setTaskStatus.bind(null, t.id, "open")}>
                      <button className="button button-secondary">Reopen</button>
                    </form>
                  )}
                  <form action={deleteTask.bind(null, t.id)}>
                    <ConfirmButton
                      className="button button-secondary m-danger"
                      message="Delete this task? This cannot be undone."
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
