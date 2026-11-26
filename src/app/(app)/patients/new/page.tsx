import Link from "next/link";
import { PatientForm } from "@/components/internal/patient-form";
import { requirePerm } from "@/lib/auth";
import { createPatient } from "../actions";

export const metadata = { title: "New Patient Registration — Northline Dental Clinic" };

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; email?: string; phone?: string }>;
}) {
  await requirePerm("patients:write");
  const sp = await searchParams;
  const defaults = {
    fullName: sp.name ?? "",
    email: sp.email ?? "",
    phone: sp.phone ?? "",
  };

  return (
    <div className="m-stack" style={{ maxWidth: "56rem", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div>
          <Link href="/patients" className="back-link">← Return to patient directory</Link>
          <div className="page-header-tag" style={{ marginTop: "0.4rem" }}>
            <span>Electronic Dental Record (EDR)</span>
          </div>
          <h1>Register New Patient</h1>
          <p className="page-header-sub">Create medical profile, clinical history, and contact details</p>
        </div>
      </div>
      <div className="card" style={{ padding: "1.75rem 2rem", borderRadius: "var(--radius-lg)" }}>
        <PatientForm action={createPatient} defaults={defaults} submitLabel="Save patient record" />
      </div>
    </div>
  );
}
