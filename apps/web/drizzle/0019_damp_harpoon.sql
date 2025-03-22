ALTER TABLE "golive_courses" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "golive_users" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "golive_users" ADD CONSTRAINT "golive_users_username_unique" UNIQUE("username");