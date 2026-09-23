ALTER TABLE `venues` ADD COLUMN `address` text NOT NULL DEFAULT '{}';--> statement-breakpoint
UPDATE `venues` SET `address` = `address_obj`;--> statement-breakpoint
ALTER TABLE `venues` DROP COLUMN `address_obj`;--> statement-breakpoint
CREATE TRIGGER `venues_address_required_insert` BEFORE INSERT ON `venues`
WHEN NEW.`address` = '{}'
BEGIN
	SELECT RAISE(ABORT, 'Venue address is required');
END;--> statement-breakpoint
CREATE TRIGGER `venues_address_required_update` BEFORE UPDATE OF `address` ON `venues`
WHEN NEW.`address` = '{}'
BEGIN
	SELECT RAISE(ABORT, 'Venue address is required');
END;
