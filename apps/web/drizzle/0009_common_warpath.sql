ALTER TABLE "golive_course_contents" ALTER COLUMN "sections" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "golive_course_contents" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "golive_courses" ALTER COLUMN "tags" SET NOT NULL;