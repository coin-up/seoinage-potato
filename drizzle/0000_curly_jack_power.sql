CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "potatoOrders" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticketCode" varchar(4) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"receivedAt" bigint NOT NULL,
	"completedAt" bigint,
	CONSTRAINT "potatoOrders_ticketCode_unique" UNIQUE("ticketCode")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
