CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`type` text DEFAULT 'event-report' NOT NULL,
	`status` text NOT NULL,
	`payload` text NOT NULL,
	`result` text,
	`error` text
);
