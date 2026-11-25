ALTER TABLE "staff_members" ADD COLUMN "public_title" text;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "experience" text;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "availability" text;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "languages" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "qualifications" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "philosophy" text;