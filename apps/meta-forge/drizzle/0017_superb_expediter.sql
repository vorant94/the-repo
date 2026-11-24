CREATE TABLE `api_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `venue_owners` (
	`venue_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`venue_id`, `user_id`),
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
ALTER TABLE `archetypes` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `archetypes` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `events` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `events` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `jobs` ADD `requested_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `jobs` ADD `event_id` text;--> statement-breakpoint
ALTER TABLE `players` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `players` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `ranks` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `ranks` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `venues` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `venues` ADD `updated_by` text REFERENCES users(id);
