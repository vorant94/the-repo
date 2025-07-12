DELETE FROM `sites`;--> statement-breakpoint
DELETE FROM `chains`;--> statement-breakpoint
ALTER TABLE `chains` ADD `external_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `external_id` text NOT NULL;
