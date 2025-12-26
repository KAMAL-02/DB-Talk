CREATE TYPE "public"."db_mode" AS ENUM('url', 'parts');--> statement-breakpoint
CREATE TYPE "public"."db_source" AS ENUM('postgres', 'mongo');--> statement-breakpoint
CREATE TABLE "database_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "db_source" NOT NULL,
	"mode" "db_mode" NOT NULL,
	"db_credentials" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
