CREATE TABLE `limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`capacity` integer NOT NULL,
	`expires_at` integer NOT NULL,
	CONSTRAINT "within_capacity" CHECK("limits"."count" <= "limits"."capacity")
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`day` text NOT NULL,
	`is_read` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "message_length" CHECK(length("messages"."body") BETWEEN 1 AND 8000)
);
--> statement-breakpoint
CREATE TABLE `used_proofs` (
	`signature` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
