PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_archetypes` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_archetypes`("id", "created_at", "updated_at", "name") SELECT "id", "created_at", "updated_at", "name" FROM `archetypes`;--> statement-breakpoint
DROP TABLE `archetypes`;--> statement-breakpoint
ALTER TABLE `__new_archetypes` RENAME TO `archetypes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `archetypes_name_unique` ON `archetypes` (`name`);--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`event_date` text NOT NULL,
	`host_id` text NOT NULL,
	FOREIGN KEY (`host_id`) REFERENCES `hosts`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "created_at", "updated_at", "name", "event_date", "host_id") SELECT "id", "created_at", "updated_at", "name", "event_date", "host_id" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE TABLE `__new_hosts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_hosts`("id", "created_at", "updated_at", "name", "address") SELECT "id", "created_at", "updated_at", "name", "address" FROM `hosts`;--> statement-breakpoint
DROP TABLE `hosts`;--> statement-breakpoint
ALTER TABLE `__new_hosts` RENAME TO `hosts`;--> statement-breakpoint
CREATE UNIQUE INDEX `hosts_name_unique` ON `hosts` (`name`);--> statement-breakpoint
CREATE TABLE `__new_players` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_players`("id", "created_at", "updated_at", "name") SELECT "id", "created_at", "updated_at", "name" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;--> statement-breakpoint
CREATE UNIQUE INDEX `players_name_unique` ON `players` (`name`);--> statement-breakpoint
CREATE TABLE `__new_ranks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`event_id` text NOT NULL,
	`player_id` text NOT NULL,
	`archetype_id` text NOT NULL,
	`position` integer NOT NULL,
	`wins` integer NOT NULL,
	`losses` integer NOT NULL,
	`draws` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`archetype_id`) REFERENCES `archetypes`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "ranks_position_positive" CHECK("__new_ranks"."position" > 0),
	CONSTRAINT "ranks_record_non_negative" CHECK("__new_ranks"."wins" >= 0 AND "__new_ranks"."losses" >= 0 AND "__new_ranks"."draws" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_ranks`("id", "created_at", "updated_at", "event_id", "player_id", "archetype_id", "position", "wins", "losses", "draws") SELECT "id", "created_at", "updated_at", "event_id", "player_id", "archetype_id", "position", "wins", "losses", "draws" FROM `ranks`;--> statement-breakpoint
DROP TABLE `ranks`;--> statement-breakpoint
ALTER TABLE `__new_ranks` RENAME TO `ranks`;--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_event_player_unique` ON `ranks` (`event_id`,`player_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_event_position_unique` ON `ranks` (`event_id`,`position`);