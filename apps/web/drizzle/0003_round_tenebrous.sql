CREATE TYPE "public"."user_type_enum" AS ENUM('student', 'teacher');--> statement-breakpoint
ALTER TABLE "golive_users" ADD COLUMN "user_type" "user_type_enum" DEFAULT 'student' NOT NULL;