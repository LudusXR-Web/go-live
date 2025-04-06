ALTER TABLE "golive_accounts" DROP CONSTRAINT "golive_accounts_user_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_courses" DROP CONSTRAINT "golive_courses_author_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_media" DROP CONSTRAINT "golive_media_author_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_personal_details" DROP CONSTRAINT "golive_personal_details_user_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_posts" DROP CONSTRAINT "golive_posts_author_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_sessions" DROP CONSTRAINT "golive_sessions_user_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_users_to_courses" DROP CONSTRAINT "golive_users_to_courses_user_id_golive_users_id_fk";
--> statement-breakpoint
ALTER TABLE "golive_accounts" ADD CONSTRAINT "golive_accounts_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_courses" ADD CONSTRAINT "golive_courses_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_media" ADD CONSTRAINT "golive_media_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_personal_details" ADD CONSTRAINT "golive_personal_details_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_posts" ADD CONSTRAINT "golive_posts_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_sessions" ADD CONSTRAINT "golive_sessions_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "golive_users_to_courses" ADD CONSTRAINT "golive_users_to_courses_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;