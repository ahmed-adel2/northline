/* Deletes every row flagged is_demo=true. Run before loading real clinic data:  pnpm db:wipe-demo */
try { process.loadEnvFile(".env.local"); } catch { /* env already set */ }
import postgres from "postgres";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local");
const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  await sql.begin(async (t) => {
    await t`delete from insurance_claims where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from lab_orders where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from invoices where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from treatment_plans where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from tooth_findings where is_demo`;
    await t`delete from inventory_items where is_demo`;
    await t`delete from clinic_settings where is_demo`;
    await t`delete from tasks where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from appointments where is_demo or patient_id in (select id from patients where is_demo)`;
    await t`delete from patients where is_demo`;
    await t`delete from staff_members where is_demo and clerk_user_id is null`;
    await t`delete from branches where is_demo and not exists (select 1 from staff_members s where s.branch_id = branches.id)`;
  });
  console.log("Demo rows removed. Staff with real Clerk accounts were kept.");
}
main().finally(() => sql.end());
