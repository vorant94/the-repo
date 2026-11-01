-- Preserve addresses while changing nullability without rebuilding the referenced venues table.
CREATE TABLE `__venue_addresses` AS SELECT `id`, `address` FROM `venues`;
--> statement-breakpoint
ALTER TABLE `venues` DROP COLUMN `address`;
--> statement-breakpoint
ALTER TABLE `venues` ADD `address` text;
--> statement-breakpoint
UPDATE `venues` SET `address` = (SELECT `address` FROM `__venue_addresses` WHERE `__venue_addresses`.`id` = `venues`.`id`);
--> statement-breakpoint
DROP TABLE `__venue_addresses`;
