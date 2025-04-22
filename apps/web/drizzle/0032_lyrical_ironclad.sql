ALTER TABLE "golive_chat_rooms" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "golive_chat_rooms" ADD COLUMN "image" varchar(255);--> statement-breakpoint
ALTER TABLE "golive_chat_rooms" ADD CONSTRAINT "golive_chat_rooms_image_golive_media_id_fk" FOREIGN KEY ("image") REFERENCES "public"."golive_media"("id") ON DELETE no action ON UPDATE no action;