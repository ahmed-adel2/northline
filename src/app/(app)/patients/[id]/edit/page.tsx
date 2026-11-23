import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PatientForm } from "@/components/internal/patient-form";
import { getDb, patients } from "@/db";
import { requirePerm } from "@/lib/auth";
import { parsePatientCode } from "@/lib/format";
import { updatePatient } from "../../actions";

export default async function EditPatient({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("patients:write");
  const { id } = await params;
  const no = parsePatientCode(id);
  if (no === null) notFound();
  const [p] = await getDb().select().from(patients).where(eq(patients.patientNo, no)).limit(1);
  if (!p) notFound();
  return (
    <div className="m-stack" style={{ maxWidth: "56rem", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div>
          <Link href={`/patients/${id}`} className="back-link">← Return to {p.fullName}&apos;s profile</Link>
          <div className="page-header-tag" style={{ marginTop: "0.4rem" }}>
            <span>Update Dental Record</span>
          </div>
          <h1>Edit Patient File</h1>
          <p className="page-header-sub">Update medical alerts, contact numbers, and address</p>
        </div>
      </div>
      <div className="card" style={{ padding: "1.75rem 2rem", borderRadius: "var(--radius-lg)" }}>
        <PatientForm action={updatePatient.bind(null, id)} defaults={p} submitLabel="Save changes" />
      </div>
    </div>
  );
}
