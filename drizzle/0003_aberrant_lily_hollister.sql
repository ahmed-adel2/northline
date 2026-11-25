CREATE TABLE "doctor_monthly_salaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"month" text NOT NULL,
	"gross_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"salary_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"appointments_count" integer DEFAULT 0 NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doctor_monthly_salaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "doctor_monthly_salaries" ADD CONSTRAINT "doctor_monthly_salaries_doctor_id_staff_members_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "doctor_monthly_salaries_doctor_month_idx" ON "doctor_monthly_salaries" USING btree ("doctor_id","month");