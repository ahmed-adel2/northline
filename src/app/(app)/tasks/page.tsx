import "@/app/(app)/internal.css";
import { demoTasks } from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Tasks() {
  const openTasks = demoTasks.filter((t) => t.status === "open" || t.status === "in-progress");
  const doneTasks = demoTasks.filter((t) => t.status === "done");

  return (
    <div className="tasks-wrap">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>{openTasks.length} open · {doneTasks.length} completed · synthetic demo data</p>
        </div>
        <button type="button" className="button button-primary">
          New task <ArrowUpRight />
        </button>
      </div>

      <div className="filter-bar">
        <input type="search" className="filter-search" placeholder="Search tasks…" aria-label="Search tasks" />
        <div className="filter-chips">
          <button className="filter-chip filter-chip-active">All ({demoTasks.length})</button>
          <button className="filter-chip">Open ({openTasks.length})</button>
          <button className="filter-chip">Done ({doneTasks.length})</button>
          <button className="filter-chip">High priority ({demoTasks.filter((t) => t.priority === "high").length})</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Task list">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Task</th>
              <th scope="col">Type</th>
              <th scope="col">Assigned to</th>
              <th scope="col">Patient</th>
              <th scope="col">Due</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoTasks.map((t) => (
              <tr key={t.id} className={`task-row${t.status === "done" ? " task-done" : ""}`}>
                <td data-label="ID" className="task-id">{t.id}</td>
                <td data-label="Task">
                  <div>
                    <span style={{ display: "block", fontWeight: 550, fontSize: "0.85rem" }}>{t.title}</span>
                    <span style={{ display: "block", color: "var(--clinic-muted)", fontSize: "0.75rem", marginTop: "0.15rem" }}>{t.description.slice(0, 60)}…</span>
                  </div>
                </td>
                <td data-label="Type">
                  <span className={`badge badge-task-${t.type.toLowerCase()}`}>{t.type}</span>
                </td>
                <td data-label="Assigned to" style={{ fontSize: "0.82rem" }}>{t.assignedTo}</td>
                <td data-label="Patient">
                  {t.patientId ? (
                    <a href={`/patients/${t.patientId}`} className="patient-name">
                      {t.patientName}
                    </a>
                  ) : (
                    <span style={{ color: "var(--clinic-muted)" }}>—</span>
                  )}
                </td>
                <td data-label="Due" className="numeric">{t.due}</td>
                <td data-label="Priority">
                  <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                </td>
                <td data-label="Status">
                  <span className={`badge badge-${t.status}`}>
                    {t.status === "done" ? "Complete" : t.status === "in-progress" ? "In progress" : "Open"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
