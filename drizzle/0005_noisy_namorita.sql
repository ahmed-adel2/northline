CREATE TABLE "patient_arrivals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"member_name" text NOT NULL,
	"email" text,
	"username" text,
	"phone" text,
	"arrived_at" timestamp with time zone DEFAULT now() NOT NULL,
	"patient_id" uuid,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_arrivals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patient_arrivals" ADD CONSTRAINT "patient_arrivals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;