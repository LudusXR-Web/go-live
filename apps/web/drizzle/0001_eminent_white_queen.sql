CREATE TABLE IF NOT EXISTS "golive_courses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) DEFAULT '',
	"author_id" varchar(255) NOT NULL,
	"tags" varchar(255)[] DEFAULT '{}'
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "golive_courses" ADD CONSTRAINT "golive_courses_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
