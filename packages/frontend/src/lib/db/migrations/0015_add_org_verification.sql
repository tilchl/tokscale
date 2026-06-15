ALTER TABLE "users" ADD COLUMN "org_verified_login" varchar(39);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "org_verified_at" timestamp with time zone;
