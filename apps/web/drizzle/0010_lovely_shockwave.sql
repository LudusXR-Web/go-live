CREATE TABLE "golive_media" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "golive_media" ADD CONSTRAINT "golive_media_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE no action;