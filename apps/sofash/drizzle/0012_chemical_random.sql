PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_titles` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'title' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL,
	`release_year` integer NOT NULL,
	`external_id` text NOT NULL
);
--> statement-breakpoint
-- INSERT INTO `__new_titles`("id", "resource_type", "created_at", "updated_at", "name", "release_year", "external_id") SELECT "id", "resource_type", "created_at", "updated_at", "name", "release_year", "external_id" FROM `titles`;
DROP TABLE `titles`;--> statement-breakpoint
ALTER TABLE `__new_titles` RENAME TO `titles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
