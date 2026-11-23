CREATE TABLE "clinic_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_name" text DEFAULT 'Northline Dental Clinic' NOT NULL,
	"branch_name" text DEFAULT 'Main Branch',
	"address" text,
	"phone" text,
	"email" text,
	"tax_id" text,
	"public_pricelist" boolean DEFAULT true,
	"opening_hours" jsonb,
	"integrations" jsonb,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinic_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_no" text NOT NULL,
	"invoice_id" text,
	"patient_id" uuid,
	"patient_name" text NOT NULL,
	"insurance" text NOT NULL,
	"member_id" text,
	"submitted_date" date,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"approved_amount" numeric(12, 2),
	"status" text DEFAULT 'submitted' NOT NULL,
	"rejection_reason" text,
	"notes" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insurance_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 0 NOT NULL,
	"unit_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"supplier" text,
	"last_restocked" date,
	"status" text DEFAULT 'in-stock' NOT NULL,
	"linked_procedures" text[] DEFAULT '{}' NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_no" text NOT NULL,
	"patient_id" uuid,
	"patient_name" text NOT NULL,
	"appointment_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"paid" numeric(12, 2) DEFAULT '0' NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"payment_method" text,
	"insurance" text,
	"insurance_claim" text,
	"notes" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_no" text NOT NULL,
	"patient_id" uuid,
	"patient_name" text NOT NULL,
	"doctor_id" uuid,
	"lab_name" text NOT NULL,
	"work_type" text NOT NULL,
	"tooth" text,
	"sent_date" date NOT NULL,
	"expected_date" date NOT NULL,
	"received_date" date,
	"status" text DEFAULT 'sent' NOT NULL,
	"cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lab_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tooth_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" text NOT NULL,
	"tooth" integer NOT NULL,
	"status" text DEFAULT 'healthy' NOT NULL,
	"notes" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tooth_findings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_no" text NOT NULL,
	"patient_id" uuid,
	"patient_name" text NOT NULL,
	"doctor_id" uuid,
	"doctor_name" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_date" date NOT NULL,
	"approved_date" date,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "treatment_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_doctor_id_staff_members_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_doctor_id_staff_members_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;