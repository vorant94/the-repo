ALTER TABLE `chains` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `chains` RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_type` text DEFAULT 'user' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`telegram_chat_id` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegramChatId_unique` ON `users` (`telegram_chat_id`);--> statement-breakpoint
ALTER TABLE `chains` ADD `resource_type` text DEFAULT 'chain' NOT NULL;--> statement-breakpoint
ALTER TABLE `chains` ADD `created_by` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `chains` ADD `name` text NOT NULL;