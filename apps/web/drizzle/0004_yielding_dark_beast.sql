CREATE TABLE "golive_users_to_courses" (
	"user_id" varchar(255) NOT NULL,
	"course_id" varchar(255) NOT NULL,
	CONSTRAINT "golive_users_to_courses_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "golive_users_to_courses" ADD CONSTRAINT "golive_users_to_courses_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "golive_users_to_courses" ADD CONSTRAINT "golive_users_to_courses_course_id_golive_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."golive_courses"("id") ON DELETE no action ON UPDATE no action;