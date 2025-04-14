ALTER TABLE "golive_events" ADD COLUMN "max_attendees" integer;--> statement-breakpoint
ALTER TABLE "golive_events" ADD COLUMN "send_updates" boolean DEFAULT true NOT NULL;