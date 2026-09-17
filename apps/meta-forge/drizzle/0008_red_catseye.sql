-- Rename in place so events and their cascading ranks remain intact on D1.
ALTER TABLE `hosts` RENAME TO `venues`;--> statement-breakpoint
DROP INDEX `hosts_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `venues_name_unique` ON `venues` (`name`);
