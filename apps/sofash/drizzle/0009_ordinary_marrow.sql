CREATE TABLE `releases` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'release' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`chain_id` text NOT NULL,
	`external_id` text NOT NULL,
	`title_id` text NOT NULL,
	FOREIGN KEY (`chain_id`) REFERENCES `chains`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `titles` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'release' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `titles_name_unique` ON `titles` (`name`);--> statement-breakpoint
DROP INDEX `chains_name_unique`;--> statement-breakpoint
DROP INDEX `sites_name_unique`;