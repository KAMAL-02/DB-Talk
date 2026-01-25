ALTER TABLE "database_connections" ALTER COLUMN "mode" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."db_mode";--> statement-breakpoint
CREATE TYPE "public"."db_mode" AS ENUM('url', 'parameters');--> statement-breakpoint
ALTER TABLE "database_connections" ALTER COLUMN "mode" SET DATA TYPE "public"."db_mode" USING "mode"::"public"."db_mode";--> statement-breakpoint
ALTER TABLE "database_connections" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."db_source";