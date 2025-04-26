ALTER TABLE "golive_courses" ADD COLUMN "external" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "golive_courses" ADD COLUMN "external_url" text;