PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`hosted_at` text NOT NULL,
	`hosted_by` text NOT NULL,
	FOREIGN KEY (`hosted_by`) REFERENCES `hosts`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "created_at", "updated_at", "name", "hosted_at", "hosted_by") SELECT "id", "created_at", "updated_at", "name", "hosted_at", "hosted_by" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;