CREATE TABLE "golive_personal_details" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"pronouns" varchar(16),
	"bio" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "golive_personal_details" ADD CONSTRAINT "golive_personal_details_user_id_golive_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE no action;