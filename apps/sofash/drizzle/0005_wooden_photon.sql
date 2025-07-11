DROP INDEX `chains_type_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `chains_name_unique` ON `chains` (`name`);--> statement-breakpoint
ALTER TABLE `chains` DROP COLUMN `type`;--> statement-breakpoint
CREATE UNIQUE INDEX `sites_name_unique` ON `sites` (`name`);--> statement-breakpoint
ALTER TABLE `sites` DROP COLUMN `site_id`;