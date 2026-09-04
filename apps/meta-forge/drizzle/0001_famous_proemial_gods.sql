ALTER TABLE `archetypes` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `archetypes` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `hosts` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `hosts` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `ranks` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `ranks` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;