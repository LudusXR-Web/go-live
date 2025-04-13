ALTER TABLE "golive_events" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_idx" ON "golive_users" USING btree ("username");