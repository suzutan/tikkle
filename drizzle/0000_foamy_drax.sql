CREATE TABLE `timers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`target_date` text,
	`start_date` text,
	`current_value` integer,
	`max_value` integer,
	`last_updated_at` text,
	`recovery_interval_minutes` real,
	`increment_amount` integer,
	`schedule_times` text
);
