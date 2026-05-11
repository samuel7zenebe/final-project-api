ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;