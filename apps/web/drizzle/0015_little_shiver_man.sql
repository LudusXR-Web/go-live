CREATE TABLE "golive_posts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"attachments" varchar(255)[] DEFAULT '{}'
);
--> statement-breakpoint
ALTER TABLE "golive_posts" ADD CONSTRAINT "golive_posts_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_author_id_idx" ON "golive_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "course_id_idx" ON "golive_course_contents" USING btree ("courseId");