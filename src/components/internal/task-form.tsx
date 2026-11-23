"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/form";

const TYPES = ["Call", "Invoice", "Inventory", "Clinical", "Admin", "Finance", "Lab"];

export function TaskForm({
  action, patients, staff,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  patients: { id: string; label: string }[]; staff: string[];
}) {
  const [state, run, pending] = useActionState(action, { ok: false } as FormState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form action={run} ref={ref} className="m-form">
      <div className="m-grid">
        <label className="m-field m-span">Task *
          <input name="title" required minLength={3} />
        </label>
        <label className="m-field">Type
          <select name="type" defaultValue="Admin">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="m-field">Priority
          <select name="priority" defaultValue="medium">
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </label>
        <label className="m-field">Due
          <input name="dueDate" type="date" />
        </label>
        <label className="m-field">Assigned to
          <input name="assignedTo" list="staff-names" />
          <datalist id="staff-names">{staff.map((s) => <option key={s} value={s} />)}</datalist>
        </label>
        <label className="m-field m-span">Patient
          <select name="patientId" defaultValue="">
            <option value="">None</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <label className="m-field m-span">Details
          <textarea name="description" rows={2} />
        </label>
      </div>
      {state.error && <p className="m-error" role="alert">{state.error}</p>}
      {state.ok && <p className="m-ok" role="status">Task added.</p>}
      <div className="m-actions">
        <button className="button button-primary" disabled={pending}>{pending ? "Adding…" : "Add task"}</button>
      </div>
    </form>
  );
}
