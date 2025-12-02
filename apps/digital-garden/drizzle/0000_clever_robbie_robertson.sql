CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`secret_hash` blob NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
