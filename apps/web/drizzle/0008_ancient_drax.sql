CREATE TABLE "golive_course_contents" (
	"courseId" varchar(255) PRIMARY KEY NOT NULL,
	"sections" jsonb[] DEFAULT '{}',
	"content" jsonb[] DEFAULT '{}'
);
--> statement-breakpoint
ALTER TABLE "golive_courses" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "golive_course_contents" ADD CONSTRAINT "golive_course_contents_courseId_golive_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."golive_courses"("id") ON DELETE no action ON UPDATE no action;