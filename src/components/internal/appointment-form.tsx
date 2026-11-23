"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";

type Opt = { id: string; label: string };
export type ApptDefaults = Partial<{
  patientId: string; doctorId: string | null; apptDate: string; startTime: string; endTime: string;
  procedure: string; room: string | null; notes: string | null; amount: string;
}>;

export function AppointmentForm({
  action, patients, doctors, defaults = {}, submitLabel,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  patients: Opt[]; doctors: Opt[]; defaults?: ApptDefaults; submitLabel: string;
}) {
  const [state, run, pending] = useActionState(action, { ok: false } as FormState);
  const d = defaults;
  return (
    <form action={run} className="m-form">
      <div className="m-grid">
        <label className="m-field m-span">Patient *
          <select name="patientId" required defaultValue={d.patientId ?? ""}>
            <option value="" disabled>Choose a patient…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <label className="m-field m-span">Doctor
          <select name="doctorId" defaultValue={d.doctorId ?? ""}>
            <option value="">Unassigned</option>
            {doctors.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <label className="m-field m-span">Date *
          <input name="apptDate" type="date" required defaultValue={d.apptDate} />
        </label>
        <label className="m-field">Starts *
          <input name="startTime" type="time" step={300} required defaultValue={d.startTime?.slice(0, 5) ?? "09:00"} />
        </label>
        <label className="m-field">Ends *
          <input name="endTime" type="time" step={300} required defaultValue={d.endTime?.slice(0, 5) ?? "09:30"} />
        </label>
        <label className="m-field m-span">Procedure *
          <input name="procedure" required defaultValue={d.procedure} placeholder="Check-up, Filling, Crown…" />
        </label>
        <label className="m-field">Room
          <input name="room" defaultValue={d.room ?? ""} />
        </label>
        <label className="m-field">Expected fee
          <input name="amount" type="number" min={0} step="any" inputMode="decimal" defaultValue={d.amount ?? "0"} />
        </label>
        <label className="m-field m-span">Notes
          <textarea name="notes" rows={2} defaultValue={d.notes ?? ""} />
        </label>
      </div>
      {state.error && <p className="m-error" role="alert">{state.error}</p>}
      <div className="m-actions">
        <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
}
