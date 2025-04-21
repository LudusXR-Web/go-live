CREATE TABLE "golive_chat_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"room_id" varchar(255) NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "golive_chat_rooms" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"members" varchar(255)[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "golive_accounts" ALTER COLUMN "scope" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "golive_chat_messages" ADD CONSTRAINT "golive_chat_messages_room_id_golive_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."golive_chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "golive_chat_messages" ADD CONSTRAINT "golive_chat_messages_author_id_golive_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."golive_users"("id") ON DELETE no action ON UPDATE cascade;