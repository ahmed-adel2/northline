import { desc, isNull } from "drizzle-orm";
import { getDb, patientArrivals, patients } from "@/db";
import { getSession } from "@/lib/auth";
import { patientCode } from "@/lib/format";
import { QrClient, type ArrivalItem } from "./qr-client";

export const metadata = { title: "QR Access & Check-in — Northline Dental Clinic" };

export default async function QRCodesPage() {
  await getSession();
  const db = getDb();

  const [arrivalRows, patientRows] = await Promise.all([
    db
      .select()
      .from(patientArrivals)
      .orderBy(desc(patientArrivals.arrivedAt))
      .limit(50),
    db
      .select({
        id: patients.id,
        patientNo: patients.patientNo,
        fullName: patients.fullName,
        email: patients.email,
        phone: patients.phone,
      })
      .from(patients)
      .where(isNull(patients.archivedAt))
      .orderBy(desc(patients.createdAt))
      .limit(100),
  ]);

  const byId = new Map(patientRows.map((p) => [p.id, p]));
  const byEmail = new Map(
    patientRows
      .filter((p) => p.email)
      .map((p) => [p.email!.trim().toLowerCase(), p])
  );
  const byPhone = new Map(
    patientRows.map((p) => [p.phone.trim().toLowerCase(), p])
  );

  const arrivals: ArrivalItem[] = arrivalRows.map((a) => {
    const emailKey = a.email?.trim().toLowerCase();
    const usernameKey = a.username?.trim().toLowerCase();
    const phoneKey = a.phone?.trim().toLowerCase();

    const matched =
      (a.patientId ? byId.get(a.patientId) : undefined) ??
      (emailKey ? byEmail.get(emailKey) : undefined) ??
      (usernameKey ? byPhone.get(usernameKey) ?? byEmail.get(usernameKey) : undefined) ??
      (phoneKey ? byPhone.get(phoneKey) : undefined);

    return {
      id: a.id,
      memberName: a.memberName,
      email: a.email,
      username: a.username,
      phone: a.phone,
      arrivedAtIso: a.arrivedAt.toISOString(),
      isNew: !matched,
      matchedPatientCode: matched ? patientCode(matched.patientNo) : null,
    };
  });

  return <QrClient arrivals={arrivals} />;
}
