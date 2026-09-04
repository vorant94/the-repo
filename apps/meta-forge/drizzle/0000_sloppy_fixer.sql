CREATE TABLE `archetypes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archetypes_name_unique` ON `archetypes` (`name`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`event_date` text NOT NULL,
	`host_id` text NOT NULL,
	FOREIGN KEY (`host_id`) REFERENCES `hosts`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `hosts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hosts_name_unique` ON `hosts` (`name`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_name_unique` ON `players` (`name`);--> statement-breakpoint
CREATE TABLE `ranks` (
	`id` text PRIMARY KEY NOT NULL,
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
	CONSTRAINT "ranks_position_positive" CHECK("ranks"."position" > 0),
	CONSTRAINT "ranks_record_non_negative" CHECK("ranks"."wins" >= 0 AND "ranks"."losses" >= 0 AND "ranks"."draws" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_event_player_unique` ON `ranks` (`event_id`,`player_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_event_position_unique` ON `ranks` (`event_id`,`position`);