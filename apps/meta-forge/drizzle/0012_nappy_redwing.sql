CREATE TABLE `__address_migration_venues` AS SELECT `id`, `created_at`, `updated_at`, `name`, `address` FROM `venues`;--> statement-breakpoint
CREATE TABLE `__address_migration_events` AS SELECT `id`, `created_at`, `updated_at`, `name`, `hosted_at`, `hosted_by` FROM `events`;--> statement-breakpoint
CREATE TABLE `__address_migration_ranks` AS SELECT `id`, `created_at`, `updated_at`, `event_id`, `player_id`, `archetype_id`, `position`, `wins`, `losses`, `draws`, `is_archetype_hidden` FROM `ranks`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
DROP TABLE `venues`;--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL
);--> statement-breakpoint
INSERT INTO `venues` (`id`, `created_at`, `updated_at`, `name`, `address`)
SELECT `id`, `created_at`, `updated_at`, `name`, `address` FROM `__address_migration_venues`;--> statement-breakpoint
CREATE UNIQUE INDEX `venues_name_unique` ON `venues` (`name`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`hosted_at` text NOT NULL,
	`hosted_by` text NOT NULL,
	FOREIGN KEY (`hosted_by`) REFERENCES `venues`(`id`) ON UPDATE cascade ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `events` (`id`, `created_at`, `updated_at`, `name`, `hosted_at`, `hosted_by`)
SELECT `id`, `created_at`, `updated_at`, `name`, `hosted_at`, `hosted_by` FROM `__address_migration_events`;--> statement-breakpoint
INSERT INTO `ranks` (`id`, `created_at`, `updated_at`, `event_id`, `player_id`, `archetype_id`, `position`, `wins`, `losses`, `draws`, `is_archetype_hidden`)
SELECT `id`, `created_at`, `updated_at`, `event_id`, `player_id`, `archetype_id`, `position`, `wins`, `losses`, `draws`, `is_archetype_hidden` FROM `__address_migration_ranks`;--> statement-breakpoint
DROP TABLE `__address_migration_ranks`;--> statement-breakpoint
DROP TABLE `__address_migration_events`;--> statement-breakpoint
DROP TABLE `__address_migration_venues`;
