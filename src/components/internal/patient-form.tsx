"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";

export type PatientDefaults = Partial<{
  fullName: string; dob: string | null; gender: string | null; phone: string; email: string | null;
  nationalId: string | null; address: string | null; bloodType: string | null; allergies: string[];
  insuranceProvider: string | null; insuranceMemberId: string | null; notes: string | null; loyaltyPoints: number;
}>;

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientForm({
  action, defaults = {}, submitLabel,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  defaults?: PatientDefaults;
  submitLabel: string;
}) {
  const [state, run, pending] = useActionState(action, { ok: false } as FormState);
  const d = defaults;
  return (
    <form action={run} className="m-form" noValidate={false}>
      <div className="m-grid">
        <label className="m-field m-span">Full name *
          <input name="fullName" required defaultValue={d.fullName} autoComplete="off" />
        </label>
        <label className="m-field">Phone *
          <input name="phone" type="tel" inputMode="tel" required defaultValue={d.phone} />
        </label>
        <label className="m-field">Email
          <input name="email" type="email" inputMode="email" defaultValue={d.email ?? ""} />
        </label>
        <label className="m-field">Date of birth
          <input name="dob" type="date" defaultValue={d.dob ?? ""} />
        </label>
        <label className="m-field">Gender
          <select name="gender" defaultValue={d.gender ?? ""}>
            <option value="">Not stated</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label className="m-field">National ID
          <input name="nationalId" inputMode="numeric" defaultValue={d.nationalId ?? ""} />
        </label>
        <label className="m-field">Blood type
          <select name="bloodType" defaultValue={d.bloodType ?? ""}>
            <option value="">Unknown</option>
            {BLOOD.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className="m-field m-span">Address
          <input name="address" defaultValue={d.address ?? ""} />
        </label>
        <label className="m-field m-span">Allergies (comma separated)
          <input name="allergies" defaultValue={(d.allergies ?? []).join(", ")} placeholder="Penicillin, Latex" />
        </label>
        <label className="m-field">Insurance provider
          <input name="insuranceProvider" defaultValue={d.insuranceProvider ?? ""} />
        </label>
        <label className="m-field">Member ID
          <input name="insuranceMemberId" defaultValue={d.insuranceMemberId ?? ""} />
        </label>
        <label className="m-field m-span">Notes
          <textarea name="notes" rows={3} defaultValue={d.notes ?? ""} />
        </label>
        {typeof d.loyaltyPoints === "number" && (
          <label className="m-field m-span">Loyalty points balance
            <input
              name="loyaltyPoints"
              type="number"
              min="0"
              max="2147483647"
              step="1"
              inputMode="numeric"
              required
              defaultValue={d.loyaltyPoints}
            />
          </label>
        )}
      </div>
      {state.error && <p className="m-error" role="alert">{state.error}</p>}
      <div className="m-actions">
        <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
}
