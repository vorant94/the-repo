PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chains` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'chain' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_chains`("id", "resource_type", "created_at", "updated_at", "name") SELECT "id", "resource_type", "created_at", "updated_at", "name" FROM `chains`;--> statement-breakpoint
DROP TABLE `chains`;--> statement-breakpoint
ALTER TABLE `__new_chains` RENAME TO `chains`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'user' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`telegram_chat_id` integer NOT NULL,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "resource_type", "created_at", "updated_at", "telegram_chat_id") SELECT "id", "resource_type", "created_at", "updated_at", "telegram_chat_id" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegramChatId_unique` ON `users` (`telegram_chat_id`);
