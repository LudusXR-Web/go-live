CREATE TABLE "golive_events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"author_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "golive_events" ADD CONSTRAINT "golive_events_course_id_golive_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."golive_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "golive_events" ADD CONSTRAINT "golive_events_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;