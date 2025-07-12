PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sites` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'site' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL,
	`chain_id` text NOT NULL,
	FOREIGN KEY (`chain_id`) REFERENCES `chains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- INSERT INTO `__new_sites`("id", "resource_type", "created_at", "updated_at", "name", "chain_id") SELECT "id", "resource_type", "created_at", "updated_at", "name", "chain_id" FROM `sites`;
DROP TABLE `sites`;--> statement-breakpoint
ALTER TABLE `__new_sites` RENAME TO `sites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `sites_name_unique` ON `sites` (`name`);
