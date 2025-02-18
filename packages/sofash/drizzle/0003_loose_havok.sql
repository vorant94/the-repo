CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'site' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL,
	`site_id` text NOT NULL,
	`chain_id` text NOT NULL,
	FOREIGN KEY (`chain_id`) REFERENCES `chains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `chains` ADD `type` text;